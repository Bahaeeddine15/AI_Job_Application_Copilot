from typing import Optional
from sqlalchemy.orm import Session
from sqlalchemy import Column, Integer, String, DateTime, func
from app.database.base import Base 

class Users(Base):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True, autoincrement=True)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    password_hash = Column(String, nullable=False)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    def __repr__(self):
        return f"<Users(id={self.id}, first_name='{self.first_name}', last_name='{self.last_name}', email='{self.email}')>"
    
    @property
    def hashed_password(self) -> str:
        return self.password_hash

    @classmethod
    def get_by_email(cls, db: Session, email: str) -> Optional["Users"]:
        return db.query(cls).filter(cls.email == email).first()

    @classmethod
    def create(cls, db: Session, email: str, hashed_password: str, first_name: str = "", last_name: str = "") -> "Users":
        user = cls(
            first_name=first_name ,
            last_name=last_name ,
            email=email,
            password_hash=hashed_password
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        return user