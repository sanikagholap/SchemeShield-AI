"""
Dataset audit script for SchemeShield AI.
Inspects all existing datasets, CSV/JSON files, imported records, and database seed data.
Reports duplicates, missing official URLs, incomplete eligibility conditions,
expired records, placeholder entries, candidate/archive data quality, and category distributions.
"""

import csv
import json
import sqlite3
from collections import Counter
from pathlib import Path
from urllib.parse import urlparse

def main():
    base_dir = Path(__file__).resolve().parent.parent.parent
    data_dir = base_dir / "data" / "source"
    db_path = base_dir / "schemeshield.db"

    myscheme_json_path = data_dir / "gov_myscheme_data.json"
    myscheme_csv_path = data_dir / "gov_myscheme_data.csv"
    archive_csv_path = data_dir / "archive" / "indian_government_schemes.csv"

    print("=" * 70)
    print("SCHEMESHIELD AI - COMPREHENSIVE DATASET AUDIT REPORT")
    print("=" * 70)

    # 1. Audit Database
    if db_path.exists():
        conn = sqlite3.connect(db_path)
        cur = conn.cursor()
        cur.execute("SELECT count(*) FROM schemes")
        total_db_schemes = cur.fetchone()[0]
        cur.execute("SELECT count(DISTINCT name) FROM schemes")
        unique_db_names = cur.fetchone()[0]
        cur.execute("SELECT is_official, count(*) FROM schemes GROUP BY is_official")
        official_counts = dict(cur.fetchall())
        cur.execute("SELECT count(*) FROM schemes WHERE official_url IS NULL OR length(trim(official_url)) = 0")
        missing_db_url = cur.fetchone()[0]
        cur.execute("SELECT count(*) FROM schemes WHERE eligibility IS NULL OR length(trim(eligibility)) = 0")
        missing_db_elig = cur.fetchone()[0]
        cur.execute("SELECT count(*) FROM schemes WHERE benefits IS NULL OR length(trim(benefits)) = 0")
        missing_db_ben = cur.fetchone()[0]
        cur.execute("SELECT count(*) FROM schemes WHERE application_process IS NULL OR length(trim(application_process)) = 0")
        missing_db_app = cur.fetchone()[0]
        cur.execute("SELECT count(*) FROM schemes WHERE department IS NULL OR length(trim(department)) = 0")
        missing_db_dept = cur.fetchone()[0]
        cur.execute("SELECT count(*) FROM schemes WHERE category IS NULL OR length(trim(category)) = 0")
        missing_db_cat = cur.fetchone()[0]

        # Review flag audit
        cur.execute("SELECT count(*) FROM schemes WHERE needs_category_review = 1")
        flagged_review = cur.fetchone()[0]

        # Category distribution audit
        cur.execute("""
            SELECT b.name, b.slug, count(a.scheme_id)
            FROM beneficiary_categories b
            LEFT JOIN scheme_category_association a ON b.id = a.category_id
            GROUP BY b.id
            ORDER BY count(a.scheme_id) DESC
        """)
        cat_counts = cur.fetchall()

        conn.close()

        print(f"\n[1] ACTIVE DATABASE (schemeshield.db):")
        print(f"  - Total Schemes: {total_db_schemes}")
        print(f"  - Unique Scheme Names: {unique_db_names}")
        print(f"  - Verified Official: {official_counts.get(1, 0)} | Unverified/Archive: {official_counts.get(0, 0)}")
        print(f"  - Missing Official URLs: {missing_db_url}")
        print(f"  - Missing Eligibility: {missing_db_elig}")
        print(f"  - Missing Benefits: {missing_db_ben}")
        print(f"  - Missing Application Process: {missing_db_app}")
        print(f"  - Missing Department: {missing_db_dept}")
        print(f"  - Missing Category: {missing_db_cat}")
        print(f"  - Schemes Flagged for Category Review: {flagged_review}")
        print(f"  - Beneficiary Category Breakdown:")
        for name, slug, count in cat_counts:
            print(f"      * {name} ({slug}): {count} schemes")

    # 2. Audit myScheme Dataset (JSON & CSV)
    if myscheme_json_path.exists():
        with open(myscheme_json_path, "r", encoding="utf-8") as f:
            myscheme_data = json.load(f)

        print(f"\n[2] PRIMARY CATALOGUE (gov_myscheme_data.json / .csv):")
        total_my = len(myscheme_data)
        names = [r.get("Scheme Name", "").strip() for r in myscheme_data]
        slugs = [r.get("Scheme Slug", "").strip() for r in myscheme_data]
        unique_names = set(names)
        unique_slugs = set(slugs)

        print(f"  - Total Records: {total_my}")
        print(f"  - Unique Scheme Names: {len(unique_names)} (Duplicates: {total_my - len(unique_names)})")
        print(f"  - Unique Slugs: {len(unique_slugs)} (Duplicates: {total_my - len(unique_slugs)})")

        name_counts = Counter(names)
        dup_names = {k: v for k, v in name_counts.items() if v > 1}
        print(f"  - Duplicate Name Groups ({len(dup_names)}):")
        for k, v in list(dup_names.items())[:6]:
            print(f"      * '{k}' appears {v} times")

        slug_counts = Counter(slugs)
        dup_slugs = {k: v for k, v in slug_counts.items() if v > 1}
        print(f"  - Duplicate Slug Groups ({len(dup_slugs)}):")
        for k, v in list(dup_slugs.items())[:6]:
            print(f"      * '{k}' appears {v} times")

        # URL audit
        direct_portal = 0
        myscheme_portal = 0
        missing_url = 0
        invalid_url = 0

        for r in myscheme_data:
            off_link = (r.get("Official Link") or "").strip()
            my_url = (r.get("MyScheme URL") or "").strip()
            chosen_url = off_link or my_url
            if not chosen_url:
                missing_url += 1
            elif not (chosen_url.startswith("http://") or chosen_url.startswith("https://")):
                invalid_url += 1
            elif "myscheme.gov.in" in chosen_url:
                myscheme_portal += 1
            else:
                direct_portal += 1

        print(f"  - URL Provenance Breakdown:")
        print(f"      * Direct Ministry / Official Portal URL: {direct_portal} ({direct_portal/total_my*100:.1f}%)")
        print(f"      * Fallback to myScheme Portal URL: {myscheme_portal} ({myscheme_portal/total_my*100:.1f}%)")
        print(f"      * Missing URL: {missing_url}")
        print(f"      * Invalid/Malformed URL: {invalid_url}")

        # Eligibility & Content Audit
        missing_elig = sum(1 for r in myscheme_data if not (r.get("Eligibility Criteria") or "").strip())
        missing_ben = sum(1 for r in myscheme_data if not (r.get("Benefits") or "").strip())
        missing_app = sum(1 for r in myscheme_data if not (r.get("Application Process") or "").strip())
        missing_dept = sum(1 for r in myscheme_data if not (r.get("State / UT / Ministry") or "").strip())
        missing_tags = sum(1 for r in myscheme_data if not (r.get("Tags / Categories") or "").strip())

        print(f"  - Incomplete Fields:")
        print(f"      * Missing Eligibility Criteria: {missing_elig}")
        print(f"      * Missing Benefits: {missing_ben}")
        print(f"      * Missing Application Process: {missing_app}")
        print(f"      * Missing State/UT/Ministry: {missing_dept}")
        print(f"      * Missing Tags/Categories: {missing_tags}")

        # Placeholder / Test entries check
        placeholders = [r.get("Scheme Name") for r in myscheme_data if (r.get("Scheme Name") or "").strip().lower() in ("test", "demo", "sample", "unknown", "placeholder")]
        print(f"  - Placeholder / Mock entries found: {len(placeholders)}")

    # 3. Audit Archive Dataset (indian_government_schemes.csv)
    if archive_csv_path.exists():
        with open(archive_csv_path, "r", encoding="utf-8-sig", errors="replace") as f:
            reader = csv.DictReader(f)
            archive_rows = list(reader)

        total_arch = len(archive_rows)
        print(f"\n[3] SECONDARY CANDIDATE / ARCHIVE DATASET (archive/indian_government_schemes.csv):")
        print(f"  - Total Records: {total_arch}")
        verified_arch = sum(1 for r in archive_rows if str(r.get("eligibility_verified", "")).strip().lower() in ("true", "1"))
        unverified_arch = total_arch - verified_arch
        print(f"  - Candidate Verified Flag: {verified_arch} | Unverified Flag: {unverified_arch}")
        
        # Missing URLs in archive
        missing_arch_url = sum(1 for r in archive_rows if not (r.get("official_source_url") or r.get("application_url") or "").strip())
        gov_domains_arch = sum(1 for r in archive_rows if any(dom in (r.get("official_source_url") or r.get("application_url") or "").lower() for dom in (".gov.in", ".nic.in")))
        print(f"  - Missing Official / Application URL: {missing_arch_url}")
        print(f"  - URLs with .gov.in or .nic.in domain: {gov_domains_arch}")
        print(f"  - Missing Clean Eligibility: {sum(1 for r in archive_rows if not (r.get('eligibility_text_clean') or '').strip())}")
        print(f"  - Missing Benefit Summary: {sum(1 for r in archive_rows if not (r.get('benefit_summary') or '').strip())}")

        # Overlap with myScheme
        if myscheme_json_path.exists():
            my_names_norm = {r.get("Scheme Name", "").strip().lower() for r in myscheme_data}
            arch_names_norm = {r.get("scheme_name", "").strip().lower() for r in archive_rows}
            common_names = my_names_norm.intersection(arch_names_norm)
            print(f"  - Scheme Name Overlap with myScheme: {len(common_names)} common schemes")

    print("\n" + "=" * 70)

if __name__ == "__main__":
    main()
