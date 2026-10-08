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
