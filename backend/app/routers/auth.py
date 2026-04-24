

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import JSONResponse
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel
from datetime import timedelta
from sqlalchemy.orm import Session
from typing import Optional

from app.services.auth_service import hash_password, verify_password, create_access_token
from app.services.response_service import success_response, error_response
from app.models.Users import Users
from app.database.connection import get_db
from app.services.auth_service import get_current_user

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

class RegisterRequest(BaseModel):
    first_name: str
    last_name: str
    email: str
    password: str

class LoginRequest(BaseModel):
    email: str
    password: str

class UpdateProfileRequest(BaseModel):
    professional_email: Optional[str] = None
    phone_number: Optional[str] = None
    linkedin_url: Optional[str] = None
    country: Optional[str] = None
    city: Optional[str] = None

@router.post("/register", response_model=dict)
def register_user(payload: RegisterRequest, db: Session = Depends(get_db)):
    existing = Users.get_by_email(db, payload.email)
    if existing:
        return JSONResponse(content=error_response("Email already registered", code=400), status_code=400)
    hashed = hash_password(payload.password)
    user = Users.create(db, email=payload.email, hashed_password=hashed, first_name=payload.first_name, last_name=payload.last_name)
    return success_response(data={"message": "User registered successfully", "user_id": getattr(user, "id", None)})

@router.post("/login", response_model=dict)
async def login_user(payload: LoginRequest, db: Session = Depends(get_db)):
    user = Users.get_by_email(db, payload.email)
    if not user or not verify_password(payload.password, user.hashed_password):
        return JSONResponse(content=error_response("Invalid credentials", code=401), status_code=401)
    token = create_access_token(subject=payload.email, expires_delta=timedelta(minutes=60))
    
    return success_response(data={"access_token": token, "token_type": "bearer"})

# in auth.py
@router.post("/token")
def token_login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = Users.get_by_email(db, form_data.username)
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    token = create_access_token(subject=user.email)
    return {"access_token": token, "token_type": "bearer"}

@router.put("/profile", response_model=dict)
def update_profile(
    payload: UpdateProfileRequest,
    db: Session = Depends(get_db),
    current_user: Users = Depends(get_current_user),
):
    if payload.professional_email is not None:
        current_user.professional_email = payload.professional_email.strip() or None
    if payload.phone_number is not None:
        current_user.phone_number = payload.phone_number.strip() or None
    if payload.linkedin_url is not None:
        current_user.linkedin_url = payload.linkedin_url.strip() or None
    if payload.country is not None:
        current_user.country = payload.country.strip() or None
    if payload.city is not None:
        current_user.city = payload.city.strip() or None

    db.commit()
    db.refresh(current_user)

    return success_response(
        data={
            "id": current_user.id,
            "professional_email": current_user.professional_email,
            "phone_number": current_user.phone_number,
            "linkedin_url": current_user.linkedin_url,
            "country": current_user.country,
            "city": current_user.city,
            },
        message="Profile updated successfully",
    )

@router.get("/profile", response_model=dict)
def get_profile(
    current_user: Users = Depends(get_current_user),
):
    return success_response(
        data={
            "id": current_user.id,
            "professional_email": current_user.professional_email,
            "phone_number": current_user.phone_number,
            "linkedin_url": current_user.linkedin_url,
            "country": current_user.country,
            "city": current_user.city,
        }
    )

# @router.post("/login")
# def login_user(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
#     user = Users.get_by_email(db, form_data.username)  # username field will contain email
#     if not user or not verify_password(form_data.password, user.hashed_password):
#         raise HTTPException(
#             status_code=status.HTTP_401_UNAUTHORIZED,
#             detail="Incorrect username or password",
#             headers={"WWW-Authenticate": "Bearer"},
#         )

#     token = create_access_token(
#         subject=user.email,
#     )
#     return {"access_token": token, "token_type": "bearer"}
