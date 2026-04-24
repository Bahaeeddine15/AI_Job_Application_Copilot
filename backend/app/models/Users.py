from typing import Optional
from sqlalchemy.orm import Session
from sqlalchemy import Column, Integer, String, DateTime, func
from app.database.base import Base


class Users(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, autoincrement=True)

    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)

    email = Column(String(255), unique=True, nullable=False)
    password_hash = Column(String, nullable=False)

    professional_email = Column(String(255), nullable=True)
    phone_number = Column(String(50), nullable=True)
    linkedin_url = Column(String(500), nullable=True)
    country = Column(String(100), nullable=True)
    city = Column(String(100), nullable=True)

    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    def __repr__(self):
        return (
            f"<Users(id={self.id}, first_name='{self.first_name}', "
            f"last_name='{self.last_name}', email='{self.email}')>"
        )

    @property
    def hashed_password(self) -> str:
        return self.password_hash

    @classmethod
    def get_by_email(cls, db: Session, email: str) -> Optional["Users"]:
        return db.query(cls).filter(cls.email == email).first()

    @classmethod
    def create(
        cls,
        db: Session,
        email: str,
        hashed_password: str,
        first_name: str = "",
        last_name: str = "",
        professional_email: Optional[str] = None,
        phone_number: Optional[str] = None,
        linkedin_url: Optional[str] = None,
        country: Optional[str] = None,
        city: Optional[str] = None,
    ) -> "Users":
        user = cls(
            first_name=first_name,
            last_name=last_name,
            email=email,
            password_hash=hashed_password,
            professional_email=professional_email,
            phone_number=phone_number,
            linkedin_url=linkedin_url,
            country=country,
            city=city,
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        return user