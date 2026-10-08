def test_health_check_endpoint(client):
    """
    Tests GET /api/health to confirm backend is healthy, responsive,
    and returns proper metadata and database status.
    """
    response = client.get("/api/health")
    assert response.status_code == 200

    data = response.json()
    assert data["status"] == "healthy"
    assert data["app"] == "SchemeShield AI"
    assert data["tagline"] == "Verify Before You Trust."
    assert "version" in data
    assert data["database_status"] == "connected"
    assert "timestamp" in data
