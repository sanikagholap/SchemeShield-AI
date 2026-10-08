def test_application_startup(client):
    """
    Verifies that the application boots properly and OpenAPI/Swagger docs are accessible.
    """
    # Verify Swagger UI
    docs_response = client.get("/docs")
    assert docs_response.status_code == 200
    assert "text/html" in docs_response.headers.get("content-type", "")

    # Verify ReDoc
    redoc_response = client.get("/redoc")
    assert redoc_response.status_code == 200

    # Verify OpenAPI JSON schema
    openapi_response = client.get("/openapi.json")
    assert openapi_response.status_code == 200
    schema = openapi_response.json()
    assert schema["info"]["title"] == "SchemeShield AI"
    assert "paths" in schema

    # Verify key route paths exist in schema
    paths = schema["paths"]
    assert "/api/health" in paths
    assert "/api/v1/auth/register" in paths
    assert "/api/v1/auth/login" in paths
    assert "/api/v1/verification/analyze" in paths
    assert "/api/v1/verification/upload" in paths
    assert "/api/v1/verification/{verification_id}" in paths
    assert "/api/v1/schemes" in paths
    assert "/api/v1/schemes/{scheme_id}" in paths
    assert "/api/v1/history" in paths
    assert "/api/v1/assistant/chat" in paths
