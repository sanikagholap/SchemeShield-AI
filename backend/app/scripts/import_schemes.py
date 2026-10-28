"""
Repeatable CLI script to validate, normalize, and ingest government scheme datasets into SchemeShield AI.

Usage:
    python -m app.scripts.import_schemes
    python -m app.scripts.import_schemes --file data/source/gov_myscheme_data.json
    python -m app.scripts.import_schemes --file data/source/archive/indian_government_schemes.csv --dry-run
    python -m app.scripts.import_schemes --file data/source/gov_myscheme_data.csv --limit 100
"""

import argparse
import sys
from pathlib import Path

# Add backend directory to path if needed
backend_dir = Path(__file__).resolve().parent.parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from app.database.connection import SessionLocal, init_db
from app.services.scheme_ingestion_service import SchemeIngestionService
from app.utils.logger import logger


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Ingest authentic government schemes into the SchemeShield database."
    )
    parser.add_argument(
        "--file",
        "-f",
        type=str,
        default="data/source/gov_myscheme_data.json",
        help="Path to CSV or JSON dataset file (relative to backend or workspace root)",
    )
    parser.add_argument(
        "--source-type",
        "-t",
        choices=["auto", "myscheme", "archive"],
        default="auto",
        help="Dataset parser type (default: auto)",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Validate records and simulate ingestion without committing to the database",
    )
    parser.add_argument(
        "--limit",
        "-n",
        type=int,
        default=None,
        help="Maximum number of records to process from the file",
    )
    parser.add_argument(
        "--verbose",
        "-v",
        action="store_true",
        help="Print verbose output including invalid record reasons",
    )
    return parser


def resolve_file_path(path_str: str) -> Path:
    raw_path = Path(path_str)
    if raw_path.is_absolute() and raw_path.exists():
        return raw_path

    # Try relative to backend dir
    cand1 = backend_dir / raw_path
    if cand1.exists():
        return cand1

    # Try relative to current working directory
    cand2 = Path.cwd() / raw_path
    if cand2.exists():
        return cand2

    # Try backend subdirectory from cwd
    cand3 = Path.cwd() / "backend" / raw_path
    if cand3.exists():
        return cand3

    return cand1


def main() -> int:
    parser = build_parser()
    args = parser.parse_args()

    resolved_path = resolve_file_path(args.file)
    if not resolved_path.exists():
        print(f"Error: Dataset file not found at '{args.file}' (checked: {resolved_path})", file=sys.stderr)
        return 1

    print("=" * 65)
    print("SchemeShield AI - Government Scheme Dataset Ingestion")
    print("=" * 65)
    print(f"Target File : {resolved_path}")
    print(f"File Size   : {resolved_path.stat().st_size:,} bytes")
    print(f"Source Type : {args.source_type}")
    print(f"Dry Run     : {'YES (simulation only)' if args.dry_run else 'NO (persisting to DB)'}")
    if args.limit:
        print(f"Limit       : {args.limit} records")
    print("-" * 65)

    # Initialize DB (creates tables and executes column migrations if needed)
    init_db()

    db = SessionLocal()
    try:
        stats = SchemeIngestionService.ingest_file(
            db=db,
            file_path=resolved_path,
            source_type=args.source_type,
            limit=args.limit,
            dry_run=args.dry_run,
        )

        print("\n--- Ingestion Summary ---")
        print(f"Total Rows Processed : {stats['total_processed']:,}")
        print(f"Successfully Imported: {stats['imported']:,}")
        print(f"Existing Upgraded    : {stats['updated']:,}")
        print(f"Skipped Duplicates   : {stats['skipped_duplicates']:,}")
        print(f"Skipped Invalid      : {stats['skipped_invalid']:,}")

        if args.verbose or stats["skipped_invalid"] > 0:
            if stats["invalid_reasons"]:
                print("\nInvalid Record Details (First few):")
                for item in stats["invalid_reasons"]:
                    print(f"  - {item}")

        print("=" * 65)
        if args.dry_run:
            print("Completed dry run successfully. No database rows were modified.")
        else:
            print("Ingestion completed successfully. Database updated.")
        return 0

    except Exception as exc:
        logger.error(f"Ingestion failed: {exc}", exc_info=True)
        print(f"\nFATAL: Ingestion failed: {exc}", file=sys.stderr)
        return 1
    finally:
        db.close()


if __name__ == "__main__":
    sys.exit(main())
