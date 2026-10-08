import uuid
from fastapi import APIRouter, status
from app.schemas.assistant import AssistantChatRequest, AssistantChatResponse
from app.schemas.common import APIResponse

router = APIRouter(prefix="/assistant", tags=["AI Assistant"])


@router.post(
    "/chat",
    response_model=APIResponse[AssistantChatResponse],
    status_code=status.HTTP_200_OK,
    summary="Chat with SchemeShield AI Assistant",
    description="Endpoint structure prepared for conversational guidance regarding government schemes and scam verification.",
)
def chat_with_assistant(payload: AssistantChatRequest) -> APIResponse[AssistantChatResponse]:
    session_id = payload.session_id or f"session_{uuid.uuid4().hex[:12]}"
    response_data = AssistantChatResponse(
        session_id=session_id,
        reply="SchemeShield AI assistant backend foundation is active. AI integration will connect to this endpoint.",
        suggested_actions=[
            "Verify a scheme text or link",
            "Browse official government schemes",
            "Check recent scam alerts",
        ],
    )
    return APIResponse(
        success=True,
        message="Assistant conversation scaffold ready.",
        data=response_data,
    )
