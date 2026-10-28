import csv
import json
import re
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple
from urllib.parse import urlparse

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.scheme import BeneficiaryCategory, Scheme
from app.services.beneficiary_service import beneficiary_service
from app.utils.logger import logger


class SchemeIngestionService:
    """
    Service responsible for validating, deduplicating, and ingesting government scheme datasets
    from official catalogs (e.g. myScheme) and secondary archives into the database.
    Preserves provenance and distinguishes official government records from unverified records.
    """

    @staticmethod
    def clean_text(val: Any) -> Optional[str]:
        """Normalizes string fields, cleans whitespace and common encoding artifacts."""
        if val is None:
            return None
        text = str(val).strip()
        if not text or text.lower() in ("nan", "null", "none"):
            return None
        text = text.replace("\u200b", "").replace("\xa0", " ").replace("\ufeff", "")
        text = re.sub(r"[ \t]+", " ", text)
        return text

    @staticmethod
    def extract_domain(url: Optional[str]) -> Optional[str]:
        """Extracts clean lowercase domain from URL."""
        if not url:
            return None
        try:
            parsed = urlparse(url.strip())
            host = parsed.netloc.split(":")[0].lower()
            if host.startswith("www."):
                host = host[4:]
            return host if host else None
        except Exception:
            return None

    @classmethod
    def parse_myscheme_record(cls, row: Dict[str, Any]) -> Dict[str, Any]:
        """Maps an official myScheme dataset record (CSV/JSON) to canonical Scheme fields."""
        raw_name = row.get("Scheme Name") or ""
        name = cls.clean_text(raw_name) or ""

        desc = cls.clean_text(row.get("Description"))
        level = cls.clean_text(row.get("Level")) or "Central Government"
        state_ministry = cls.clean_text(row.get("State / UT / Ministry")) or "Central"

        is_central = "central" in level.lower()
        state = "Central" if is_central else state_ministry
        department = state_ministry if is_central else cls.clean_text(row.get("Tags / Categories"))

        official_link = cls.clean_text(row.get("Official Link"))
        myscheme_url = cls.clean_text(row.get("MyScheme URL"))
        resolved_url = official_link or myscheme_url

        domain = cls.extract_domain(resolved_url) or "myscheme.gov.in"

        return {
            "name": name,
            "slug": cls.clean_text(row.get("Scheme Slug")),
            "description": desc,
            "department": department[:255] if department else None,
            "category": cls.clean_text(row.get("Tags / Categories"))[:128] if row.get("Tags / Categories") else None,
            "eligibility": cls.clean_text(row.get("Eligibility Criteria")),
            "benefits": cls.clean_text(row.get("Benefits")),
            "application_process": cls.clean_text(row.get("Application Process")),
            "official_url": resolved_url[:512] if resolved_url else None,
            "source_name": "myScheme",
            "source_domain": domain[:255] if domain else "myscheme.gov.in",
            "state": state[:128] if state else "Central",
            "launch_year": None,
            "is_active": True,
            "is_official": True,
            "provenance": "myscheme.gov.in (Official Government Catalog)",
        }

    @classmethod
    def parse_archive_record(cls, row: Dict[str, Any]) -> Dict[str, Any]:
        """Maps a record from the secondary archive dataset to canonical Scheme fields."""
        raw_name = row.get("scheme_name") or row.get("Scheme Name") or ""
        name = cls.clean_text(raw_name) or ""

        desc = cls.clean_text(row.get("benefit_summary")) or cls.clean_text(row.get("eligibility_text_clean"))
        dept = cls.clean_text(row.get("issuing_authority_normalized")) or cls.clean_text(row.get("issuing_authority"))
        cat = cls.clean_text(row.get("scheme_category_clean")) or cls.clean_text(row.get("scheme_category"))
        elig = cls.clean_text(row.get("eligibility_text_clean"))
        benefits = cls.clean_text(row.get("benefit_summary"))

        state_val = cls.clean_text(row.get("state_restricted_to_normalized"))
        state = "Central" if not state_val or "all india" in state_val.lower() else state_val

        off_url = cls.clean_text(row.get("official_source_url")) or cls.clean_text(row.get("application_url"))
        domain = cls.extract_domain(off_url)

        # Distinguish official verified records from unverified / inferred archive records
        verified_flag = str(row.get("eligibility_verified", "")).strip().lower() in ("true", "1")
        is_gov_domain = bool(domain and (domain.endswith(".gov.in") or domain.endswith(".nic.in")))
        is_official = verified_flag and is_gov_domain

        provenance = (
            "archive/indian_government_schemes.csv (Verified Archive)"
            if is_official
            else "archive/indian_government_schemes.csv (Unverified / Inferred Archive)"
        )

        return {
            "name": name,
            "description": desc,
            "department": dept[:255] if dept else None,
            "category": cat[:128] if cat else None,
            "eligibility": elig,
            "benefits": benefits,
            "application_process": None,
            "official_url": off_url[:512] if off_url else None,
            "source_name": "Archive: Indian Government Schemes",
            "source_domain": domain[:255] if domain else None,
            "state": state[:128] if state else "Central",
            "launch_year": None,
            "is_active": True,
            "is_official": is_official,
            "provenance": provenance,
        }

    @classmethod
    def validate_record(cls, record: Dict[str, Any]) -> Tuple[bool, Optional[str]]:
        """
        Validates record integrity:
        - Scheme name must exist, be trimmed, length between 2 and 255 chars.
        - Scheme must not be a placeholder string.
        """
        name = record.get("name")
        if not name or not isinstance(name, str) or not name.strip():
            return False, "Scheme name is missing or empty"

        cleaned_name = name.strip()
        if len(cleaned_name) < 2:
            return False, f"Scheme name '{cleaned_name}' is too short (min 2 chars)"

        if len(cleaned_name) > 255:
            return False, "Scheme name exceeds maximum length of 255 chars"

        if cleaned_name.lower() in ("test", "demo", "sample", "unknown", "placeholder"):
            return False, f"Rejected placeholder scheme name '{cleaned_name}'"

        return True, None

    @classmethod
    def ingest_records(
        cls,
        db: Session,
        records: List[Dict[str, Any]],
        dry_run: bool = False,
    ) -> Dict[str, Any]:
        """
        Validates, deduplicates against database, and persists records safely.
        Does not delete existing data. Never downgrades official records.
        """
        stats = {
            "total_processed": len(records),
            "imported": 0,
            "updated": 0,
            "skipped_duplicates": 0,
            "skipped_invalid": 0,
            "invalid_reasons": [],
        }

        # Ensure default beneficiary categories exist and cache them
        beneficiary_service.seed_default_categories(db)
        cat_lookup = {c.slug: c for c in db.scalars(select(BeneficiaryCategory)).all()}

        # Load existing scheme names in bulk for fast duplicate checking
        existing_schemes = {s.name.lower().strip(): s for s in db.scalars(select(Scheme)).all()}

        for rec in records:
            is_valid, reason = cls.validate_record(rec)
            if not is_valid:
                stats["skipped_invalid"] += 1
                if len(stats["invalid_reasons"]) < 10:
                    stats["invalid_reasons"].append(f"{rec.get('name', 'Unknown')}: {reason}")
                continue

            name_key = rec["name"].lower().strip()
            existing = existing_schemes.get(name_key)
            rec_is_official = bool(rec.get("is_official", True))

            # Classify scheme into persistent beneficiary categories
            cat_slugs, is_ambiguous, ambiguity_reason = beneficiary_service.classify_scheme_with_details(rec)
            matched_categories = [cat_lookup[s] for s in cat_slugs if s in cat_lookup]

            if existing:
                existing_is_official = getattr(existing, "is_official", True)
                # If existing is already official and incoming is unverified archive, skip to protect official truth
                if existing_is_official and not rec_is_official:
                    stats["skipped_duplicates"] += 1
                    continue

                # If existing is unverified archive and incoming is verified official myScheme record, upgrade it!
                if not existing_is_official and rec_is_official:
                    if not dry_run:
                        existing.slug = rec.get("slug") or existing.slug
                        existing.description = rec.get("description") or existing.description
                        existing.department = rec.get("department") or existing.department
                        existing.category = rec.get("category") or existing.category
                        existing.beneficiary_categories = json.dumps(cat_slugs)
                        existing.beneficiary_category_links = matched_categories
                        existing.eligibility = rec.get("eligibility") or existing.eligibility
                        existing.benefits = rec.get("benefits") or existing.benefits
                        existing.application_process = rec.get("application_process") or existing.application_process
                        existing.official_url = rec.get("official_url") or existing.official_url
                        existing.source_name = rec.get("source_name") or existing.source_name
                        existing.source_domain = rec.get("source_domain") or existing.source_domain
                        existing.source_type = rec.get("source_type") or existing.source_type
                        existing.state = rec.get("state") or existing.state
                        existing.is_official = True
                        existing.provenance = rec.get("provenance") or existing.provenance
                        existing.needs_category_review = is_ambiguous
                        existing.category_review_reason = ambiguity_reason
                    stats["updated"] += 1
                else:
                    # Update category links if missing on existing record
                    if not dry_run and (not existing.beneficiary_category_links or not existing.beneficiary_categories):
                        existing.beneficiary_categories = json.dumps(cat_slugs)
                        existing.beneficiary_category_links = matched_categories
                        existing.needs_category_review = is_ambiguous
                        existing.category_review_reason = ambiguity_reason
                    stats["skipped_duplicates"] += 1
            else:
                # New record
                if not dry_run:
                    new_scheme = Scheme(
                        name=rec["name"].strip(),
                        slug=rec.get("slug"),
                        description=rec.get("description"),
                        department=rec.get("department"),
                        category=rec.get("category"),
                        beneficiary_categories=json.dumps(cat_slugs),
                        eligibility=rec.get("eligibility"),
                        benefits=rec.get("benefits"),
                        application_process=rec.get("application_process"),
                        official_url=rec.get("official_url"),
                        source_name=rec.get("source_name"),
                        source_domain=rec.get("source_domain"),
                        source_type=rec.get("source_type", "official_portal"),
                        state=rec.get("state", "Central"),
                        jurisdiction=rec.get("jurisdiction", "Central"),
                        launch_year=rec.get("launch_year"),
                        valid_from=rec.get("valid_from"),
                        valid_to=rec.get("valid_to"),
                        keywords=json.dumps(rec.get("keywords", [])) if rec.get("keywords") else None,
                        alternative_names=json.dumps(rec.get("alternative_names", [])) if rec.get("alternative_names") else None,
                        is_active=rec.get("is_active", True),
                        is_official=rec_is_official,
                        provenance=rec.get("provenance"),
                        needs_category_review=is_ambiguous,
                        category_review_reason=ambiguity_reason,
                    )
                    new_scheme.beneficiary_category_links = matched_categories
                    db.add(new_scheme)
                    existing_schemes[name_key] = new_scheme
                stats["imported"] += 1

        if not dry_run:
            db.commit()

        return stats

    @classmethod
    def ingest_file(
        cls,
        db: Session,
        file_path: Path,
        source_type: str = "auto",
        limit: Optional[int] = None,
        dry_run: bool = False,
    ) -> Dict[str, Any]:
        """
        Ingests a JSON or CSV dataset file with auto-detection of format and schema.
        """
        file_path = Path(file_path)
        if not file_path.exists():
            raise FileNotFoundError(f"Dataset file not found: {file_path}")

        ext = file_path.suffix.lower()
        records_raw: List[Dict[str, Any]] = []

        if ext == ".json":
            with open(file_path, "r", encoding="utf-8") as f:
                content = f.read().strip()
                if not content:
                    records_raw = []
                else:
                    loaded = json.loads(content)
                    records_raw = loaded if isinstance(loaded, list) else [loaded]

        elif ext == ".csv":
            with open(file_path, "r", encoding="utf-8-sig", errors="replace") as f:
                reader = csv.DictReader(f)
                records_raw = list(reader)
        else:
            raise ValueError(f"Unsupported dataset format '{ext}'. Must be .json or .csv")

        if limit and limit > 0:
            records_raw = records_raw[:limit]

        # Auto-detect source type
        if source_type == "auto":
            if records_raw and "Scheme Slug" in records_raw[0]:
                source_type = "myscheme"
            elif records_raw and "scheme_category_clean" in records_raw[0]:
                source_type = "archive"
            elif "myscheme" in file_path.name.lower():
                source_type = "myscheme"
            else:
                source_type = "myscheme"

        # Transform raw rows to canonical Scheme dictionaries
        canonical_records: List[Dict[str, Any]] = []
        for r in records_raw:
            if source_type == "myscheme":
                canonical = cls.parse_myscheme_record(r)
            else:
                canonical = cls.parse_archive_record(r)
            canonical_records.append(canonical)

        result_stats = cls.ingest_records(db=db, records=canonical_records, dry_run=dry_run)
        result_stats["file_name"] = file_path.name
        result_stats["source_type"] = source_type
        result_stats["dry_run"] = dry_run
        return result_stats


scheme_ingestion_service = SchemeIngestionService()
