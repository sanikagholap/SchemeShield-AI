from fastapi import APIRouter

from app.routes.auth import router as auth_router
from app.routes.schemes import router as schemes_router
from app.routes.verify import router as verify_router
from app.routes.verification import router as verification_router
from app.routes.history import router as history_router
from app.routes.assistant import router as assistant_router

api_v1_router = APIRouter(prefix="/api/v1")

# Mount modular route controllers under versioned prefix
api_v1_router.include_router(auth_router)
api_v1_router.include_router(schemes_router)
api_v1_router.include_router(verify_router)
api_v1_router.include_router(verification_router)
api_v1_router.include_router(history_router)
api_v1_router.include_router(assistant_router)
