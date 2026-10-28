"""
Service for managing configurable Beneficiary Categories, classifying schemes,
and evaluating individual citizen profile eligibility recommendations.
"""

import json
import re
from typing import Any, Dict, List, Optional, Set, Tuple
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.scheme import BeneficiaryCategory, Scheme, scheme_category_association
from app.utils.logger import logger


DEFAULT_BENEFICIARY_CATEGORIES: List[Dict[str, Any]] = [
    {
        "name": "Student",
        "slug": "student",
        "description": "Scholarships, fellowships, educational stipends, fee concessions, coaching, and student welfare schemes.",
        "keywords": [
            "student", "scholarship", "fellowship", "stipend", "school", "college",
            "matric", "university", "education", "tuition", "hostel", "ugc",
            "aicte", "coaching", "vidya", "olympiad", "merit", "post-matric", "pre-matric"
        ],
        "icon": "GraduationCap",
    },
    {
        "name": "Teacher",
        "slug": "teacher",
        "description": "Educator awards, faculty development, pedagogy research, teaching grants, and academic instructor welfare.",
        "keywords": [
            "teacher", "educator", "faculty", "pedagogy", "teaching", "shikshak",
            "professor", "instructor", "lecturer", "national award to teachers"
        ],
        "icon": "BookOpen",
    },
    {
        "name": "Farmer",
        "slug": "farmer",
        "description": "Agricultural subsidies, crop insurance, PM-KISAN, machinery, livestock, irrigation, seeds, and rural farming support.",
        "keywords": [
            "farmer", "agriculture", "crop", "kisan", "fpo", "livestock", "fertilizer",
            "dairy", "irrigation", "tractor", "harvest", "horticulture", "fisheries",
            "mandi", "msp", "soil health", "sericulture", "cultivator", "animal husbandry"
        ],
        "icon": "Tractor",
    },
    {
        "name": "Women",
        "slug": "women",
        "description": "Women empowerment, maternity benefits, self-help groups (SHG), girls' welfare, and women entrepreneurship.",
        "keywords": [
            "women", "woman", "girl", "daughter", "widow", "pregnant", "lactating",
            "maternity", "mahila", "nari", "beti", "kanya", "female", "stree",
            "sukanya", "shg", "destitute women"
        ],
        "icon": "HeartHandshake",
    },
    {
        "name": "Senior Citizen",
        "slug": "senior-citizen",
        "description": "Old-age pensions, geriatric healthcare, retirement security, and social safety net for citizens aged 60 and above.",
        "keywords": [
            "senior citizen", "elderly", "old age", "pension", "retirement", "60 years",
            "geriatric", "vridha", "age 60", "destitute elderly", "indira gandhi national old age"
        ],
        "icon": "ShieldCheck",
    },
    {
        "name": "Entrepreneur",
        "slug": "entrepreneur",
        "description": "MSME loans, startup seed funding, PMEGP, Mudra credit, industrial subsidies, and business development.",
        "keywords": [
            "entrepreneur", "business", "startup", "msme", "enterprise", "self-employment",
            "mudra", "pmegp", "seed fund", "incubation", "capital subsidy", "industrial",
            "credit guarantee", "stand up india", "micro enterprise"
        ],
        "icon": "Briefcase",
    },
    {
        "name": "General Welfare",
        "slug": "general-welfare",
        "description": "Broad citizen welfare, poverty alleviation, food security (PDS), housing (PMAY), healthcare (PM-JAY), and civic utilities.",
        "keywords": [
            "welfare", "bpl", "ration", "food", "housing", "health", "insurance",
            "sanitation", "social security", "citizen", "ayushman", "awas", "poor",
            "differently abled", "disability", "divyang", "community"
        ],
        "icon": "Users",
    },
]


class BeneficiaryService:
    """
    Manages beneficiary categories, scheme classification, and eligibility evaluation.
    """

    @classmethod
    def seed_default_categories(cls, db: Session) -> List[BeneficiaryCategory]:
        """
        Seeds standard 7 configurable beneficiary categories if missing.
        """
        categories = []
        for cat_def in DEFAULT_BENEFICIARY_CATEGORIES:
            existing = db.scalars(
                select(BeneficiaryCategory).where(BeneficiaryCategory.slug == cat_def["slug"])
            ).first()
            if not existing:
                new_cat = BeneficiaryCategory(
                    name=cat_def["name"],
                    slug=cat_def["slug"],
                    description=cat_def["description"],
                    keywords=json.dumps(cat_def["keywords"]),
                    icon=cat_def.get("icon"),
                    is_active=True,
                )
                db.add(new_cat)
                categories.append(new_cat)
            else:
                categories.append(existing)
        db.commit()
        return categories

    @classmethod
    def get_all_categories(cls, db: Session) -> List[Dict[str, Any]]:
        """
        Retrieves all configured beneficiary categories along with active scheme counts.
        """
        cls.seed_default_categories(db)
        categories = db.scalars(
            select(BeneficiaryCategory).where(BeneficiaryCategory.is_active == True).order_by(BeneficiaryCategory.id.asc())
        ).all()

        results = []
        for cat in categories:
            # Count schemes associated with this category
            scheme_count = len(cat.schemes)
            keywords_list = []
            if cat.keywords:
                try:
                    keywords_list = json.loads(cat.keywords)
                except Exception:
                    keywords_list = [k.strip() for k in cat.keywords.split(",") if k.strip()]

            results.append({
                "id": cat.id,
                "name": cat.name,
                "slug": cat.slug,
                "description": cat.description,
                "keywords": keywords_list,
                "icon": cat.icon,
                "scheme_count": scheme_count,
                "is_active": cat.is_active,
            })
        return results

    @classmethod
    def get_category_by_slug(cls, db: Session, slug: str) -> Optional[Dict[str, Any]]:
        """
        Retrieves a single beneficiary category by slug with real active scheme count.
        """
        cat = db.scalars(
            select(BeneficiaryCategory).where(BeneficiaryCategory.slug == slug.strip().lower())
        ).first()
        if not cat:
            return None

        keywords_list = []
        if cat.keywords:
            try:
                keywords_list = json.loads(cat.keywords)
            except Exception:
                keywords_list = [k.strip() for k in cat.keywords.split(",") if k.strip()]

        return {
            "id": cat.id,
            "name": cat.name,
            "slug": cat.slug,
            "description": cat.description,
            "keywords": keywords_list,
            "icon": cat.icon,
            "scheme_count": len(cat.schemes),
            "is_active": cat.is_active,
        }

    @classmethod
    def classify_scheme_with_details(
        cls, scheme_info: Dict[str, Any]
    ) -> Tuple[List[str], bool, Optional[str]]:
        """
        Deterministically classifies a scheme into one or more of the 7 Beneficiary Categories
        using official tags, title, description, department, and eligibility criteria text.
        Returns:
            (category_slugs, is_ambiguous, ambiguity_review_reason)
        Flags ambiguous mappings for review when:
          - Official eligibility criteria is missing or incomplete
          - Scheme only mapped to general-welfare as a fallback
          - Conflicting or broad multi-domain overlap is detected
        """
        tags = (scheme_info.get("Tags / Categories") or scheme_info.get("category") or "").lower()
        name = (scheme_info.get("Scheme Name") or scheme_info.get("name") or "").lower()
        desc = (scheme_info.get("Description") or scheme_info.get("description") or "").lower()
        elig = (scheme_info.get("Eligibility Criteria") or scheme_info.get("eligibility") or "").lower()
        dept = (scheme_info.get("State / UT / Ministry") or scheme_info.get("department") or "").lower()

        combined_text = f"{tags} {name} {desc} {elig} {dept}"

        assigned: Set[str] = set()

        # 1. Teacher Check (High specificity: avoid classifying general education as teacher unless teacher keywords exist)
        teacher_keywords = ["teacher", "educator", "faculty", "pedagogy", "teaching", "shikshak", "professor", "lecturer"]
        if any(re.search(rf"\b{re.escape(kw)}\b", combined_text) for kw in teacher_keywords):
            assigned.add("teacher")

        # 2. Student Check
        student_keywords = [
            "student", "scholarship", "fellowship", "stipend", "school", "college",
            "matric", "university", "tuition", "ugc", "aicte", "coaching", "vidya",
            "olympiad", "merit-cum-means", "higher education"
        ]
        if any(re.search(rf"\b{re.escape(kw)}\b", combined_text) for kw in student_keywords):
            assigned.add("student")

        # 3. Farmer Check
        farmer_keywords = [
            "farmer", "agriculture", "crop", "kisan", "fpo", "livestock", "fertilizer",
            "dairy", "irrigation", "tractor", "harvest", "horticulture", "fisheries",
            "mandi", "msp", "soil health", "sericulture", "cultivator", "animal husbandry",
            "krishi", "pashupalan", "matsya"
        ]
        if any(re.search(rf"\b{re.escape(kw)}\b", combined_text) for kw in farmer_keywords):
            assigned.add("farmer")

        # 4. Women Check
        women_keywords = [
            "women", "woman", "girl", "daughter", "widow", "pregnant", "lactating",
            "maternity", "mahila", "nari", "beti", "kanya", "female", "stree",
            "sukanya", "self help group", "women entrepreneur", "mother"
        ]
        if any(re.search(rf"\b{re.escape(kw)}\b", combined_text) for kw in women_keywords):
            assigned.add("women")

        # 5. Senior Citizen Check
        senior_keywords = [
            "senior citizen", "elderly", "old age", "pension", "retirement", "60 years",
            "geriatric", "vridha", "age 60", "destitute elderly", "aged person"
        ]
        if any(re.search(rf"\b{re.escape(kw)}\b", combined_text) for kw in senior_keywords):
            assigned.add("senior-citizen")

        # 6. Entrepreneur Check
        entrepreneur_keywords = [
            "entrepreneur", "business", "startup", "msme", "enterprise", "self-employment",
            "mudra", "pmegp", "seed fund", "incubation", "capital subsidy", "industrial",
            "credit guarantee", "stand up india", "micro enterprise", "swarojgar", "udyam"
        ]
        if any(re.search(rf"\b{re.escape(kw)}\b", combined_text) for kw in entrepreneur_keywords):
            assigned.add("entrepreneur")

        # 7. General Welfare Check
        general_keywords = [
            "welfare", "bpl", "ration", "food security", "housing", "pm-jay", "ayushman",
            "sanitation", "social security", "citizen", "awas", "differently abled",
            "disability", "divyang", "health insurance"
        ]
        has_general = any(re.search(rf"\b{re.escape(kw)}\b", combined_text) for kw in general_keywords)
        if has_general or not assigned:
            assigned.add("general-welfare")

        # Ambiguity and validation checks
        clean_elig = (elig or "").strip()
        is_ambiguous = False
        review_reason: Optional[str] = None

        if not clean_elig or len(clean_elig) < 15 or clean_elig.lower() in ("nan", "none", "null"):
            is_ambiguous = True
            review_reason = "Missing or insufficient eligibility criteria in official catalogue."
        elif not has_general and assigned == {"general-welfare"}:
            is_ambiguous = True
            review_reason = "Assigned fallback general-welfare category without specific beneficiary criteria."
        elif len(assigned) > 3:
            is_ambiguous = True
            review_reason = "Broad multi-domain category overlap; requires administrative review."

        return sorted(list(assigned)), is_ambiguous, review_reason

    @classmethod
    def classify_scheme(cls, scheme_info: Dict[str, Any]) -> List[str]:
        """
        Deterministically classifies a scheme into one or more of the 7 Beneficiary Categories.
        Returns a sorted list of unique category slugs.
        """
        categories, _, _ = cls.classify_scheme_with_details(scheme_info)
        return categories

    @classmethod
    def sync_scheme_category_links(cls, db: Session, force: bool = False) -> Dict[str, Any]:
        """
        Synchronizes all persisted schemes in the database into persistent scheme_category_association
        links and updates cached beneficiary_categories, needs_category_review, and category_review_reason.
        """
        cls.seed_default_categories(db)
        categories = {c.slug: c for c in db.scalars(select(BeneficiaryCategory)).all()}

        schemes = list(db.scalars(select(Scheme)).all())
        total = len(schemes)
        synced_count = 0
        ambiguous_count = 0

        for scheme in schemes:
            if not force and len(scheme.beneficiary_category_links) > 0 and scheme.beneficiary_categories:
                continue

            info = {
                "name": scheme.name,
                "description": scheme.description,
                "department": scheme.department,
                "category": scheme.category,
                "eligibility": scheme.eligibility,
            }
            slugs, is_ambiguous, reason = cls.classify_scheme_with_details(info)
            matched_cats = [categories[s] for s in slugs if s in categories]

            scheme.beneficiary_categories = json.dumps(slugs)
            scheme.beneficiary_category_links = matched_cats
            scheme.needs_category_review = is_ambiguous
            scheme.category_review_reason = reason

            synced_count += 1
            if is_ambiguous:
                ambiguous_count += 1

        if synced_count > 0:
            db.commit()
            logger.info(f"Synchronized {synced_count} schemes into persistent categories ({ambiguous_count} flagged for review).")

        return {
            "total_schemes": total,
            "synced_schemes": synced_count,
            "ambiguous_flagged": ambiguous_count,
        }

    @classmethod
    def evaluate_scheme_eligibility(
        cls,
        scheme: Scheme,
        profile: Dict[str, Any],
    ) -> Dict[str, Any]:
        """
        Evaluates a scheme against a citizen profile based on available official criteria.
        Returns one of four deterministic states:
          - 'eligible': Profile explicitly satisfies all determinable criteria.
          - 'potentially_eligible': Profile satisfies preliminary demographic criteria;
                                    additional documentation (e.g. income certificate, marksheet)
                                    must be verified against official rules.
          - 'ineligible': Profile explicitly violates at least one hard criterion
                          (e.g. residency/state restriction, gender exclusivity, age out of range).
          - 'insufficient_information': Scheme catalogue lacks eligibility details, or profile lacks
                                        basic demographic inputs.
        CRITICAL: Never awards automatic eligibility purely based on category membership.
        """
        match_reasons: List[str] = []
        missing_criteria: List[str] = []
        limitations: List[str] = []
        ineligible_reasons: List[str] = []

        eligibility_text = (scheme.eligibility or "").strip()
        scheme_state = (scheme.state or "Central").strip()
        scheme_name = scheme.name
        scheme_categories = []
        if scheme.beneficiary_categories:
            try:
                scheme_categories = json.loads(scheme.beneficiary_categories)
            except Exception:
                scheme_categories = [c.strip() for c in scheme.beneficiary_categories.split(",") if c.strip()]

        # 1. Check for Insufficient Scheme Information in the official catalogue
        if not eligibility_text or len(eligibility_text) < 15 or eligibility_text.lower() in ("nan", "none", "null"):
            return {
                "status": "insufficient_information",
                "score": 0.25,
                "match_reasons": ["Scheme matches catalog metadata."],
                "missing_criteria": ["Official eligibility criteria text is not documented in the official dataset."],
                "limitations": [
                    "This scheme's official record does not provide detailed eligibility criteria.",
                    "Consult the official scheme portal directly for application rules.",
                ],
            }

        # 2. Check for Insufficient User Profile Attributes
        user_age = profile.get("age")
        user_gender = profile.get("gender")
        user_state = profile.get("state")
        user_income = profile.get("annual_income")
        user_categories = profile.get("beneficiary_categories") or []

        has_demographic_info = any(x is not None for x in [user_age, user_gender, user_state, user_income])
        if not has_demographic_info:
            return {
                "status": "insufficient_information",
                "score": 0.3,
                "match_reasons": ["Scheme matches selected citizen interests."],
                "missing_criteria": [
                    "User profile lacks age, state of residence, gender, and income.",
                    "Provide demographic details to receive an eligibility assessment.",
                ],
                "limitations": [
                    "No automatic eligibility is granted based solely on category membership.",
                ],
            }

        score = 0.5

        # 3. Category Alignment
        if user_categories and scheme_categories:
            common_cats = set(user_categories).intersection(set(scheme_categories))
            if common_cats:
                score += 0.2
                match_reasons.append(f"Category match: {', '.join(sorted(common_cats)).title()}")
            else:
                missing_criteria.append("Scheme does not belong to your primary selected beneficiary categories.")

        # 4. State / Geographic Jurisdiction Evaluation
        if user_state and scheme_state and scheme_state.lower() not in ("central", "all india", "national"):
            clean_user_state = user_state.strip().lower()
            clean_scheme_state = scheme_state.strip().lower()

            if clean_user_state != clean_scheme_state:
                ineligible_reasons.append(
                    f"State restriction: Scheme is restricted to residents of {scheme_state}, but your profile state is {user_state}."
                )
            else:
                score += 0.15
                match_reasons.append(f"Residency requirement satisfied for {scheme_state}.")

        # 5. Gender Exclusivity Evaluation
        lower_elig = eligibility_text.lower()
        lower_name = scheme_name.lower()
        combined_text = f"{lower_name} {lower_elig}"

        is_women_only = (
            "women" in scheme_categories
            or any(kw in combined_text for kw in ["for women only", "only for girls", "girl child only", "female applicants only", "widow pension"])
        )
        if is_women_only and user_gender:
            if user_gender.strip().lower() in ("male", "man", "boy"):
                ineligible_reasons.append("Gender requirement: Scheme is restricted to female beneficiaries.")
            elif user_gender.strip().lower() in ("female", "woman", "girl"):
                score += 0.1
                match_reasons.append("Gender requirement satisfied for female-oriented program.")

        # 6. Age Boundaries Evaluation
        if user_age is not None:
            # Check for Senior Citizen restriction
            if "senior-citizen" in scheme_categories or "senior citizen" in lower_elig or "old age" in lower_elig:
                if user_age < 60:
                    ineligible_reasons.append(
                        f"Age restriction: Scheme is intended for senior citizens (typically 60+ years), but user age is {user_age}."
                    )
                else:
                    score += 0.1
                    match_reasons.append(f"Age criterion satisfied for senior citizen benefit ({user_age} years).")

            # Min Age Regex
            min_age_match = re.search(r"(?:minimum age|age (?:above|greater than|at least))\s*(?:of\s*)?(\d{1,2})", lower_elig)
            if min_age_match:
                min_age = int(min_age_match.group(1))
                if user_age < min_age:
                    ineligible_reasons.append(f"Minimum age requirement: Requires at least {min_age} years, user is {user_age}.")
                else:
                    match_reasons.append(f"Meets minimum age requirement of {min_age} years.")

            # Max Age Regex
            max_age_match = re.search(r"(?:maximum age|age (?:below|under|not exceeding|up to))\s*(?:of\s*)?(\d{1,2})", lower_elig)
            if max_age_match:
                max_age = int(max_age_match.group(1))
                if user_age > max_age:
                    ineligible_reasons.append(f"Maximum age limit: Scheme has an upper age limit of {max_age} years, user is {user_age}.")
                else:
                    match_reasons.append(f"Within maximum age limit of {max_age} years.")

        # 7. Annual Income Ceiling Evaluation
        if user_income is not None:
            income_match = re.search(r"(?:annual income|family income|income)\s*(?:not exceeding|up to|less than|below)\s*(?:rs\.?|inr)?\s*([\d,]+)", lower_elig)
            if income_match:
                try:
                    limit_str = income_match.group(1).replace(",", "")
                    income_limit = float(limit_str)
                    if income_limit > 1000:  # Valid annual income number
                        if user_income > income_limit:
                            ineligible_reasons.append(
                                f"Income limit: Household annual income exceeds threshold of ₹{income_limit:,.0f} (your income: ₹{user_income:,.0f})."
                            )
                        else:
                            score += 0.1
                            match_reasons.append(f"Income within threshold of ₹{income_limit:,.0f}.")
                except Exception:
                    pass

        # 8. Check Ineligibility Verdict
        if ineligible_reasons:
            return {
                "status": "ineligible",
                "score": 0.0,
                "match_reasons": match_reasons,
                "missing_criteria": ineligible_reasons,
                "limitations": [
                    "User profile does not qualify under official scheme rules.",
                ],
            }

        # 9. Extract Unverified Document / Administrative Requirements
        doc_patterns = [
            ("income certificate", "Official income certificate from Tahsildar / Revenue officer."),
            ("caste certificate", "Valid caste / category certificate (SC/ST/OBC/EWS)."),
            ("land records", "Land ownership / tenancy records (7/12 extract or RoR)."),
            ("bonafide student", "Bonafide student certificate / enrollment verification from recognized educational institution."),
            ("bpl card", "Valid BPL / Ration card registration."),
            ("disability certificate", "Unique Disability ID (UDID) or disability certificate >= 40%."),
            ("aadhaar", "Aadhaar authentication and bank account linking (DBT enabled)."),
        ]
        for pattern, desc in doc_patterns:
            if pattern in lower_elig:
                missing_criteria.append(desc)

        # 10. Distinguish 'eligible' from 'potentially_eligible'
        score = min(score, 1.0)
        limitations.append("Official verification and formal application submission with required documentation is required.")
        limitations.append("Scheme rules are subject to official ministerial guidelines and quota availability.")

        if score >= 0.8 and not ineligible_reasons and len(missing_criteria) <= 1:
            return {
                "status": "eligible",
                "score": round(score, 2),
                "match_reasons": match_reasons or ["Profile criteria align with official requirements."],
                "missing_criteria": missing_criteria,
                "limitations": limitations,
            }
        else:
            return {
                "status": "potentially_eligible",
                "score": round(score, 2),
                "match_reasons": match_reasons or ["Preliminary profile aligns with scheme focus."],
                "missing_criteria": missing_criteria or ["Review official eligibility text for full conditions."],
                "limitations": limitations,
            }


beneficiary_service = BeneficiaryService()
