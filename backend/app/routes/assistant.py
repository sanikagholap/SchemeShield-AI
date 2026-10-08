import uuid
from fastapi import APIRouter, Depends, status

from app.dependencies.auth import get_current_user
from app.models.user import User
from app.schemas.assistant import AssistantChatRequest, AssistantChatResponse
from app.services.assistant_service import assistant_service

router = APIRouter(prefix="/assistant", tags=["AI Assistant"])


@router.post(
    "/chat",
    response_model=AssistantChatResponse,
    status_code=status.HTTP_200_OK,
    summary="Chat with SchemeShield AI Assistant",
    description="Provides deterministic, safe, citizen-friendly guidance on scheme verification, fraud detection, and platform features at zero cost.",
)
def chat_with_assistant(
    payload: AssistantChatRequest,
    current_user: User = Depends(get_current_user),
) -> AssistantChatResponse:
    """
    Answers citizen inquiries using the local rule-and-knowledge engine.
    Requires authentication. Does not call paid external LLM APIs.
    """
    session_id = payload.session_id or f"session_{uuid.uuid4().hex[:12]}"
    result = assistant_service.answer_query(payload.message)

    return AssistantChatResponse(
        response=result["response"],
        suggestions=result["suggestions"],
        reply=result["response"],
        suggested_actions=result["suggestions"],
        session_id=session_id,
    )
