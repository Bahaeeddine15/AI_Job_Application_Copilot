from datetime import datetime, timedelta, timezone
from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.responses import JSONResponse
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from passlib.context import CryptContext
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.services.response_service import error_response
from app.core.config import settings
from app.models.Users import Users  


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto") # this is the the hashing context where we specify the hashing algo
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/token") # this is the oauth2 scheme that we will use to get the token from the request header. We specify the tokenUrl which is the endpoint where the client can get the token by providing their credentials. This will be used in the get_current_user function to extract the token from the request and decode it to get the user information.

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(subject: str, expires_delta: Optional[timedelta] = None) -> str:
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)) #when it will be expired
    to_encode = {"sub": subject, "exp": expire}
    return jwt.encode(to_encode, settings.JWT_SECRET_KEY.get_secret_value(), algorithm=settings.JWT_ALGORITHM)# create the JWT token

#this funt will decode the token the get the user s credenials
def decode_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, settings.JWT_SECRET_KEY.get_secret_value(), algorithms=[settings.JWT_ALGORITHM])
        return payload
    except JWTError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Could not validate credentials")


# we get the current user from the token . so it will be used in endpoints that requires auth to get the user so we can query the db and get the user data 
def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    payload = decode_token(token)
    email = payload.get("sub")
    if email is None:
        return JSONResponse(content=error_response("Invalid authentication credentials", code=401), status_code=401)
    user = Users.get_by_email(db, email)
    if not user:
        return JSONResponse(content=error_response("User not found", code=404), status_code=404)
    return user