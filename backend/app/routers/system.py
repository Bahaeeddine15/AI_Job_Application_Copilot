from fastapi import APIRouter
from app.core.config import settings
from app.services.response_service import success_response, error_response

router = APIRouter(
    prefix="/api/system",
    tags=["System"]
)

@router.get("/health")
def health():
    return success_response({"server": "running"})

@router.get("/version")
def get_version():
    return {
        "status": "success",
        "data": {
            "app_name": settings.app_name,
            "version": settings.version,
            "environment": settings.environment
        }
    }
