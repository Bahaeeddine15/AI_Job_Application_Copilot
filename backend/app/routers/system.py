from fastapi import APIRouter
from app.core.config import settings

router = APIRouter(
    prefix="/api/system",
    tags=["System"]
)


@router.get("/health")
async def health_check():
    return {
        "status": "success",
        "data": {
            "server": "running"
        }
    }


@router.get("/version")
async def get_version():
    return {
        "status": "success",
        "data": {
            "app_name": settings.app_name,
            "version": settings.version,
            "environment": settings.environment
        }
    }
