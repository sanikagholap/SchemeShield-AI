import pytest


def get_auth_token(client, email="scheme.admin@example.com"):
    """Helper to register and login a user and return the Bearer token."""
    client.post(
        "/api/v1/auth/register",
        json={"email": email, "password": "Password123!", "full_name": "Scheme Admin"},
    )
    login_resp = client.post(
        "/api/v1/auth/login",
        json={"email": email, "password": "Password123!"},
    )
    return login_resp.json()["access_token"]


def test_scheme_listing_public(client):
    """GET /api/v1/schemes is publicly accessible without authentication."""
    response = client.get("/api/v1/schemes")
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert "total" in data
    assert "page" in data
    assert "page_size" in data


def test_create_scheme_authenticated(client):
    """POST /api/v1/schemes succeeds with valid Bearer token."""
    token = get_auth_token(client, "scheme.creator@example.com")
    payload = {
        "name": "PM Awas Yojana (Urban)",
        "description": "Affordable housing for urban poor and middle-income groups.",
        "department": "Ministry of Housing and Urban Affairs",
        "category": "Housing",
        "eligibility": "EWS, LIG, and MIG families without a pucca house.",
        "benefits": "Interest subsidy up to 6.5% on housing loans.",
        "application_process": "Online via pmaymis.gov.in or Common Service Centres.",
        "official_url": "https://pmaymis.gov.in",
        "source_name": "myScheme",
        "source_domain": "pmaymis.gov.in",
        "state": "Central",
        "launch_year": 2015,
        "is_active": True,
    }
    response = client.post(
        "/api/v1/schemes",
        json=payload,
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "PM Awas Yojana (Urban)"
    assert data["category"] == "Housing"
    assert data["department"] == "Ministry of Housing and Urban Affairs"
    assert "id" in data
    assert "created_at" in data


def test_create_scheme_unauthenticated(client):
    """POST /api/v1/schemes fails with 401 when no token is provided."""
    payload = {
        "name": "Unauthorized Scheme Test",
        "category": "General",
    }
    response = client.post("/api/v1/schemes", json=payload)
    assert response.status_code == 401


def test_create_duplicate_scheme_name(client):
    """POST /api/v1/schemes returns 409 Conflict if scheme name already exists."""
    token = get_auth_token(client, "duplicate.scheme@example.com")
    payload = {
        "name": "Unique Scheme Test",
        "category": "Health",
    }
    first = client.post("/api/v1/schemes", json=payload, headers={"Authorization": f"Bearer {token}"})
    assert first.status_code == 201

    second = client.post("/api/v1/schemes", json=payload, headers={"Authorization": f"Bearer {token}"})
    assert second.status_code == 409
    assert "already exists" in second.json()["error"]["message"].lower()


def test_get_scheme_by_id(client):
    """GET /api/v1/schemes/{id} returns single scheme."""
    token = get_auth_token(client, "fetch.scheme@example.com")
    create_resp = client.post(
        "/api/v1/schemes",
        json={"name": "Ayushman Bharat PM-JAY", "category": "Health"},
        headers={"Authorization": f"Bearer {token}"},
    )
    scheme_id = create_resp.json()["id"]

    get_resp = client.get(f"/api/v1/schemes/{scheme_id}")
    assert get_resp.status_code == 200
    assert get_resp.json()["id"] == scheme_id
    assert get_resp.json()["name"] == "Ayushman Bharat PM-JAY"


def test_get_scheme_not_found(client):
    """GET /api/v1/schemes/{id} returns 404 for non-existent ID."""
    response = client.get("/api/v1/schemes/999999")
    assert response.status_code == 404


def test_update_scheme(client):
    """PATCH /api/v1/schemes/{id} updates fields successfully."""
    token = get_auth_token(client, "update.scheme@example.com")
    create_resp = client.post(
        "/api/v1/schemes",
        json={"name": "Initial Scheme Name", "category": "Old Category"},
        headers={"Authorization": f"Bearer {token}"},
    )
    scheme_id = create_resp.json()["id"]

    patch_resp = client.patch(
        f"/api/v1/schemes/{scheme_id}",
        json={"category": "Updated Category", "launch_year": 2024},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert patch_resp.status_code == 200
    updated = patch_resp.json()
    assert updated["category"] == "Updated Category"
    assert updated["launch_year"] == 2024
    assert updated["name"] == "Initial Scheme Name"


def test_delete_scheme(client):
    """DELETE /api/v1/schemes/{id} removes scheme safely."""
    token = get_auth_token(client, "delete.scheme@example.com")
    create_resp = client.post(
        "/api/v1/schemes",
        json={"name": "Temporary Scheme to Delete"},
        headers={"Authorization": f"Bearer {token}"},
    )
    scheme_id = create_resp.json()["id"]

    del_resp = client.delete(
        f"/api/v1/schemes/{scheme_id}",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert del_resp.status_code == 200
    assert del_resp.json()["success"] is True

    # Confirm subsequent lookup returns 404
    lookup_resp = client.get(f"/api/v1/schemes/{scheme_id}")
    assert lookup_resp.status_code == 404


def test_scheme_filtering_and_search(client):
    """Verifies search and filter by category, state, and department."""
    token = get_auth_token(client, "filter.tester@example.com")
    schemes_to_add = [
        {"name": "Filter Scheme Agri", "category": "Agriculture", "state": "Punjab", "department": "Agri Dept"},
        {"name": "Filter Scheme Edu", "category": "Education", "state": "Maharashtra", "department": "Edu Dept"},
    ]
    for s in schemes_to_add:
        client.post("/api/v1/schemes", json=s, headers={"Authorization": f"Bearer {token}"})

    # Search keyword
    res_search = client.get("/api/v1/schemes?search=Filter+Scheme+Agri")
    assert res_search.status_code == 200
    assert any(item["name"] == "Filter Scheme Agri" for item in res_search.json()["items"])

    # Category filter
    res_cat = client.get("/api/v1/schemes?category=Education")
    assert res_cat.status_code == 200
    assert all(item["category"] == "Education" for item in res_cat.json()["items"] if "Filter Scheme" in item["name"])

    # State filter
    res_state = client.get("/api/v1/schemes?state=Punjab")
    assert res_state.status_code == 200
    assert all(item["state"] == "Punjab" for item in res_state.json()["items"] if "Filter Scheme" in item["name"])


def test_list_beneficiary_categories_counts(client):
    """GET /api/v1/schemes/categories returns the 7 categories with real counts."""
    resp = client.get("/api/v1/schemes/categories")
    assert resp.status_code == 200
    categories = resp.json()
    assert len(categories) == 7

    slugs = {c["slug"] for c in categories}
    expected_slugs = {"student", "teacher", "farmer", "women", "senior-citizen", "entrepreneur", "general-welfare"}
    assert slugs == expected_slugs

    for c in categories:
        assert "id" in c
        assert "name" in c
        assert "slug" in c
        assert "scheme_count" in c
        assert isinstance(c["scheme_count"], int)
        assert c["scheme_count"] >= 0


def test_get_beneficiary_category_by_slug(client):
    """GET /api/v1/schemes/categories/{slug} returns single category or 404."""
    resp = client.get("/api/v1/schemes/categories/farmer")
    assert resp.status_code == 200
    data = resp.json()
    assert data["slug"] == "farmer"
    assert data["name"] == "Farmer"
    assert "scheme_count" in data

    # 404 for unknown
    resp_404 = client.get("/api/v1/schemes/categories/nonexistent-slug")
    assert resp_404.status_code == 404


def test_filter_schemes_by_beneficiary_category(client):
    """GET /api/v1/schemes?beneficiary_category=student filters matching schemes."""
    token = get_auth_token(client, "student.scheme@example.com")
    client.post(
        "/api/v1/schemes",
        json={
            "name": "Post-Matric Scholarship for Scheduled Castes",
            "description": "Financial assistance for scheduled caste students pursuing post-matriculation studies.",
            "eligibility": "Student must be enrolled in recognized post-secondary institution.",
        },
        headers={"Authorization": f"Bearer {token}"},
    )

    resp = client.get("/api/v1/schemes?beneficiary_category=student")
    assert resp.status_code == 200
    items = resp.json()["items"]
    assert any("Post-Matric Scholarship" in item["name"] for item in items)


def test_scheme_creation_and_classification_review_flag(client):
    """Checks that schemes with vague/missing eligibility get flagged for category review."""
    token = get_auth_token(client, "vague.scheme@example.com")
    vague_resp = client.post(
        "/api/v1/schemes",
        json={
            "name": "Vague Community Initiative",
            "description": "General program for community benefits.",
            "eligibility": "",  # Missing/empty eligibility
        },
        headers={"Authorization": f"Bearer {token}"},
    )
    assert vague_resp.status_code == 201
    data = vague_resp.json()
    assert data["needs_category_review"] is True
    assert data["category_review_reason"] is not None

    # Filter schemes by needs_category_review
    review_resp = client.get("/api/v1/schemes?needs_category_review=true")
    assert review_resp.status_code == 200
    assert any(item["name"] == "Vague Community Initiative" for item in review_resp.json()["items"])


def test_recommendations_endpoint_guest_and_authenticated(client):
    """GET /api/v1/schemes/recommendations returns explainable recommendations."""
    # Seed known specific scheme
    token = get_auth_token(client, "recom.admin@example.com")
    client.post(
        "/api/v1/schemes",
        json={
            "name": "Kisan Credit Card Scheme for Small Farmers",
            "description": "Provides timely credit to farmers for agricultural needs.",
            "category": "Agriculture",
            "state": "Maharashtra",
            "eligibility": "Small and marginal farmers residing in Maharashtra. Requires land records.",
        },
        headers={"Authorization": f"Bearer {token}"},
    )

    # 1. Guest request with matching farmer profile
    resp_guest = client.get(
        "/api/v1/schemes/recommendations?state=Maharashtra&category=farmer&age=42"
    )
    assert resp_guest.status_code == 200
    data = resp_guest.json()
    assert "items" in data
    assert "applied_profile" in data
    assert data["applied_profile"]["state"] == "Maharashtra"

    # Verify recommendation items have strict fields
    for rec in data["items"]:
        assert rec["eligibility_status"] in ("eligible", "potentially_eligible", "ineligible", "insufficient_information")
        assert 0.0 <= rec["eligibility_score"] <= 1.0
        assert isinstance(rec["match_reasons"], list)
        assert isinstance(rec["missing_criteria"], list)
        assert isinstance(rec["limitations"], list)
        assert len(rec["limitations"]) > 0

    # 2. State restriction ineligibility test: resident of Kerala querying Maharashtra-restricted scheme
    resp_ineligible = client.get(
        "/api/v1/schemes/recommendations?state=Kerala&category=farmer&age=42"
    )
    assert resp_ineligible.status_code == 200
    matched = [r for r in resp_ineligible.json()["items"] if "Kisan Credit Card" in r["scheme"]["name"]]
    if matched:
        assert matched[0]["eligibility_status"] == "ineligible"
        assert any("State restriction" in crit for crit in matched[0]["missing_criteria"])


def test_user_profile_patch_and_category_preferences(client):
    """PATCH /api/v1/users/me updates citizen profile and chosen categories."""
    token = get_auth_token(client, "profile.user@example.com")

    patch_payload = {
        "full_name": "Anita Sharma",
        "age": 34,
        "gender": "Female",
        "state": "Maharashtra",
        "annual_income": 180000.0,
        "occupation": "Farmer",
        "caste_category": "OBC",
        "is_disabled": False,
        "beneficiary_categories": ["farmer", "women"],
    }
    patch_resp = client.patch(
        "/api/v1/users/me",
        json=patch_payload,
        headers={"Authorization": f"Bearer {token}"},
    )
    assert patch_resp.status_code == 200
    user_data = patch_resp.json()
    assert user_data["full_name"] == "Anita Sharma"
    assert user_data["age"] == 34
    assert user_data["gender"] == "Female"
    assert user_data["state"] == "Maharashtra"
    assert user_data["annual_income"] == 180000.0
    assert "farmer" in user_data["beneficiary_categories"]
    assert "women" in user_data["beneficiary_categories"]

    # Verify GET /api/v1/users/me returns persisted profile
    get_resp = client.get(
        "/api/v1/users/me",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert get_resp.status_code == 200
    get_data = get_resp.json()
    assert get_data["full_name"] == "Anita Sharma"
    assert "farmer" in get_data["beneficiary_categories"]
