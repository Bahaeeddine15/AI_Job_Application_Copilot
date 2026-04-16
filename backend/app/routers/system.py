from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, EmailStr
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.core.config import settings
from app.database.connection import get_db
from app.models.Users import Users
from app.services.response_service import success_response

router = APIRouter(
    prefix="/api/system",
    tags=["System"]
)

class TestUserCreateRequest(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    password: str

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

@router.get("/db-health")
def db_health(db: Session = Depends(get_db)):
    """
    Test DB connection only.
    """
    try:
        db.execute(text("SELECT 1"))
        return success_response({"database": "connected"})
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database connection failed: {str(e)}")

@router.post("/db-test-add-user")
def db_test_add_user(payload: TestUserCreateRequest, db: Session = Depends(get_db)):
    """
    Temporary route to test insert into users table before auth.
    Remove later in production.
    """
    try:
        existing = db.query(Users).filter(Users.email == payload.email).first()
        if existing:
            raise HTTPException(status_code=409, detail="Email already exists")

        # Temporary only: store plain text for quick DB test.
        # Replace with real password hashing once auth is added.
        user = Users(
            first_name=payload.first_name,
            last_name=payload.last_name,
            email=payload.email,
            password_hash=payload.password
        )

        db.add(user)
        db.commit()
        db.refresh(user)

        return success_response({
            "id": user.id,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "email": user.email
        }, "Test user added successfully")
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Insert failed: {str(e)}")
