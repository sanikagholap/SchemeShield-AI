import json
from pathlib import Path
import pytest
from sqlalchemy import select

from app.database.connection import SessionLocal
from app.models.scheme import Scheme
from app.services.scheme_ingestion_service import SchemeIngestionService


@pytest.fixture
def db_session():
    """Provides a transactional database session for tests."""
    session = SessionLocal()
    yield session
    session.close()


def test_parse_myscheme_record():
    """Validates mapping of myScheme record to canonical scheme structure."""
    raw = {
        "Scheme Name": "Pradhan Mantri Awas Yojana - Urban (PMAY-U)",
        "Scheme Slug": "pmay-u",
        "Description": "Provides central assistance to Urban Local Bodies for housing.",
        "Level": "Central",
        "State / UT / Ministry": "Ministry of Housing and Urban Affairs",
        "Tags / Categories": "Housing & Shelter",
        "Eligibility Criteria": "Families having an annual income up to Rs 18 Lakhs.",
        "Benefits": "Interest subsidy up to 6.5%.",
        "Application Process": "Apply online at pmaymis.gov.in.",
        "Official Link": "https://pmaymis.gov.in",
        "MyScheme URL": "https://www.myscheme.gov.in/schemes/pmay-u",
    }
    parsed = SchemeIngestionService.parse_myscheme_record(raw)
    assert parsed["name"] == "Pradhan Mantri Awas Yojana - Urban (PMAY-U)"
    assert parsed["is_official"] is True
    assert parsed["provenance"] == "myscheme.gov.in (Official Government Catalog)"
    assert parsed["source_domain"] == "pmaymis.gov.in"
    assert parsed["department"] == "Ministry of Housing and Urban Affairs"
    assert parsed["state"] == "Central"


def test_parse_archive_record_verified():
    """Archive record with verified eligibility and .gov.in domain marked official."""
    raw = {
        "scheme_name": "Digital India Internship Scheme",
        "issuing_authority_normalized": "Ministry of Electronics and Information Technology",
        "scheme_category_clean": "Education & Learning",
        "eligibility_text_clean": "Indian students securing minimum 60% marks in degree.",
        "benefit_summary": "Token remuneration of Rs 10,000 per month.",
        "official_source_url": "https://meity.gov.in/schemes/internship",
        "eligibility_verified": "True",
        "state_restricted_to_normalized": "All India",
    }
    parsed = SchemeIngestionService.parse_archive_record(raw)
    assert parsed["name"] == "Digital India Internship Scheme"
    assert parsed["is_official"] is True
    assert "Verified Archive" in parsed["provenance"]
    assert parsed["state"] == "Central"
    assert parsed["source_domain"] == "meity.gov.in"


def test_parse_archive_record_unverified():
    """Archive record without verified eligibility marked unverified."""
    raw = {
        "scheme_name": "Unverified Community Welfare Initiative",
        "issuing_authority": "Local Trust Board",
        "scheme_category": "Social Welfare",
        "eligibility_text_clean": "Inferred from public forum posts.",
        "benefit_summary": "Subsidized meals.",
        "official_source_url": "http://community-blog.org/welfare",
        "eligibility_verified": "False",
        "state_restricted_to_normalized": "Maharashtra",
    }
    parsed = SchemeIngestionService.parse_archive_record(raw)
    assert parsed["name"] == "Unverified Community Welfare Initiative"
    assert parsed["is_official"] is False
    assert "Unverified / Inferred Archive" in parsed["provenance"]
    assert parsed["state"] == "Maharashtra"


def test_record_validation():
    """Checks acceptance and rejection of scheme records."""
    valid = {"name": "National Scholarship Portal"}
    ok, err = SchemeIngestionService.validate_record(valid)
    assert ok is True
    assert err is None

    empty = {"name": "   "}
    ok, err = SchemeIngestionService.validate_record(empty)
    assert ok is False
    assert "missing or empty" in err

    too_short = {"name": "A"}
    ok, err = SchemeIngestionService.validate_record(too_short)
    assert ok is False
    assert "too short" in err

    ok, err = SchemeIngestionService.validate_record({"name": "placeholder"})
    assert ok is False
    assert "placeholder" in err.lower()


def test_ingest_records_deduplication_and_idempotence(db_session):
    """Repeated ingestion of identical records must not duplicate entries."""
    unique_name = f"Test Idempotence Scheme {id(db_session)}"
    records = [
        {
            "name": unique_name,
            "description": "Idempotence verification description.",
            "department": "Department of Agriculture",
            "category": "Agriculture",
            "eligibility": "Small and marginal farmers.",
            "benefits": "Direct benefit transfer.",
            "application_process": "Online portal.",
            "official_url": "https://agricoop.nic.in",
            "source_name": "myScheme",
            "source_domain": "agricoop.nic.in",
            "state": "Central",
            "launch_year": 2024,
            "is_active": True,
            "is_official": True,
            "provenance": "myscheme.gov.in (Official Government Catalog)",
        }
    ]

    # First ingestion
    first_stats = SchemeIngestionService.ingest_records(db=db_session, records=records, dry_run=False)
    assert first_stats["imported"] == 1
    assert first_stats["skipped_duplicates"] == 0

    # Second ingestion (idempotent run)
    second_stats = SchemeIngestionService.ingest_records(db=db_session, records=records, dry_run=False)
    assert second_stats["imported"] == 0
    assert second_stats["skipped_duplicates"] == 1

    # Confirm only one record exists in DB
    found = db_session.scalars(select(Scheme).where(Scheme.name == unique_name)).all()
    assert len(found) == 1


def test_ingest_records_official_protection(db_session):
    """Archive unverified record must not downgrade an existing official record."""
    scheme_name = f"Official Protected Scheme {id(db_session)}"

    official_record = {
        "name": scheme_name,
        "description": "Official description from myScheme.",
        "department": "Ministry of Finance",
        "category": "Finance",
        "eligibility": "Official eligibility.",
        "benefits": "Official benefits.",
        "application_process": "Official process.",
        "official_url": "https://finmin.nic.in",
        "source_name": "myScheme",
        "source_domain": "finmin.nic.in",
        "state": "Central",
        "is_official": True,
        "provenance": "myscheme.gov.in (Official Government Catalog)",
    }
    SchemeIngestionService.ingest_records(db=db_session, records=[official_record], dry_run=False)

    # Attempt to overwrite with unverified archive record
    archive_unverified = {
        "name": scheme_name,
        "description": "Inferred vague description.",
        "department": "Unknown Department",
        "category": "General",
        "eligibility": "Vague",
        "benefits": "None",
        "application_process": None,
        "official_url": "http://random-blog.com",
        "source_name": "Archive",
        "source_domain": "random-blog.com",
        "state": "Central",
        "is_official": False,
        "provenance": "archive/indian_government_schemes.csv (Unverified / Inferred Archive)",
    }
    stats = SchemeIngestionService.ingest_records(db=db_session, records=[archive_unverified], dry_run=False)
    assert stats["skipped_duplicates"] == 1
    assert stats["updated"] == 0

    # Verify official record remains intact
    db_rec = db_session.scalars(select(Scheme).where(Scheme.name == scheme_name)).one()
    assert db_rec.is_official is True
    assert db_rec.description == "Official description from myScheme."
    assert db_rec.official_url == "https://finmin.nic.in"


def test_ingest_records_unverified_upgrade(db_session):
    """Official record upgrades existing unverified archive record."""
    scheme_name = f"Upgradable Scheme {id(db_session)}"

    archive_unverified = {
        "name": scheme_name,
        "description": "Vague archive text.",
        "department": "Authority X",
        "category": "General",
        "eligibility": "Unknown",
        "benefits": "Unknown",
        "application_process": None,
        "official_url": None,
        "source_name": "Archive",
        "source_domain": None,
        "state": "Central",
        "is_official": False,
        "provenance": "archive/indian_government_schemes.csv (Unverified / Inferred Archive)",
    }
    SchemeIngestionService.ingest_records(db=db_session, records=[archive_unverified], dry_run=False)

    # Ingest authentic official record
    official_upgrade = {
        "name": scheme_name,
        "description": "Authoritative official details.",
        "department": "Ministry of Rural Development",
        "category": "Rural",
        "eligibility": "BPL rural families.",
        "benefits": "Financial aid.",
        "application_process": "Block office.",
        "official_url": "https://rural.nic.in",
        "source_name": "myScheme",
        "source_domain": "rural.nic.in",
        "state": "Central",
        "is_official": True,
        "provenance": "myscheme.gov.in (Official Government Catalog)",
    }
    stats = SchemeIngestionService.ingest_records(db=db_session, records=[official_upgrade], dry_run=False)
    assert stats["updated"] == 1

    # Verify record was upgraded
    db_rec = db_session.scalars(select(Scheme).where(Scheme.name == scheme_name)).one()
    assert db_rec.is_official is True
    assert db_rec.description == "Authoritative official details."
    assert db_rec.department == "Ministry of Rural Development"


def test_ingest_file_json(db_session, tmp_path):
    """Tests file ingestion from JSON format."""
    unique_name = f"JSON File Scheme {id(db_session)}"
    sample_data = [
        {
            "Scheme Name": unique_name,
            "Description": "JSON test scheme description.",
            "Level": "Central",
            "State / UT / Ministry": "Ministry of Education",
            "Official Link": "https://education.gov.in",
            "Eligibility Criteria": "Eligible students.",
        }
    ]
    file_path = tmp_path / "sample.json"
    file_path.write_text(json.dumps(sample_data), encoding="utf-8")

    stats = SchemeIngestionService.ingest_file(db=db_session, file_path=file_path, dry_run=False)
    assert stats["total_processed"] == 1
    assert stats["imported"] == 1

    # Query DB
    rec = db_session.scalars(select(Scheme).where(Scheme.name == unique_name)).one_or_none()
    assert rec is not None
    assert rec.is_official is True


def test_ingest_file_empty(db_session, tmp_path):
    """Empty dataset file handles cleanly without error."""
    file_path = tmp_path / "empty.json"
    file_path.write_text("", encoding="utf-8")

    stats = SchemeIngestionService.ingest_file(db=db_session, file_path=file_path, dry_run=False)
    assert stats["total_processed"] == 0
    assert stats["imported"] == 0


def test_api_schemes_is_official_filter(client, db_session):
    """GET /api/v1/schemes respects is_official query filter."""
    official_name = f"API Filter Official {id(db_session)}"
    unverified_name = f"API Filter Unverified {id(db_session)}"

    SchemeIngestionService.ingest_records(
        db=db_session,
        records=[
            {
                "name": official_name,
                "description": "Official scheme.",
                "is_official": True,
                "provenance": "myscheme.gov.in",
            },
            {
                "name": unverified_name,
                "description": "Unverified scheme.",
                "is_official": False,
                "provenance": "archive",
            },
        ],
        dry_run=False,
    )

    # Filter is_official=true
    resp_off = client.get(f"/api/v1/schemes?search={official_name}&is_official=true")
    assert resp_off.status_code == 200
    items_off = resp_off.json()["items"]
    assert any(item["name"] == official_name and item["is_official"] is True for item in items_off)

    # Filter is_official=false for the official one should return 0 matches
    resp_off_filtered = client.get(f"/api/v1/schemes?search={official_name}&is_official=false")
    assert resp_off_filtered.status_code == 200
    assert all(item["name"] != official_name for item in resp_off_filtered.json()["items"])

    # Filter is_official=false for the unverified one
    resp_unv = client.get(f"/api/v1/schemes?search={unverified_name}&is_official=false")
    assert resp_unv.status_code == 200
    items_unv = resp_unv.json()["items"]
    assert any(item["name"] == unverified_name and item["is_official"] is False for item in items_unv)


def test_ingestion_persists_category_relationships_and_review_flags(db_session):
    """Verifies that ingested schemes get mapped to BeneficiaryCategory relationships and review flags."""
    scheme_name = f"Kisan Machine Grant {id(db_session)}"
    records = [
        {
            "name": scheme_name,
            "description": "Subsidies for modern agricultural machinery and tractors.",
            "department": "Ministry of Agriculture & Farmers Welfare",
            "category": "Agriculture",
            "eligibility": "Small and marginal farmers holding agricultural land records.",
            "benefits": "50% capital subsidy.",
            "official_url": "https://agrimachinery.nic.in",
            "is_official": True,
        }
    ]
    stats = SchemeIngestionService.ingest_records(db=db_session, records=records, dry_run=False)
    assert stats["imported"] == 1

    scheme = db_session.scalars(select(Scheme).where(Scheme.name == scheme_name)).one()
    # Verify beneficiary_category_links has farmer
    assert len(scheme.beneficiary_category_links) > 0
    slugs = [c.slug for c in scheme.beneficiary_category_links]
    assert "farmer" in slugs
    assert "farmer" in json.loads(scheme.beneficiary_categories)
    assert scheme.needs_category_review is False
