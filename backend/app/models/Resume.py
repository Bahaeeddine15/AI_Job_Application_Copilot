from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean, func, Text
from sqlalchemy.dialects.postgresql import JSONB
from app.database.base import Base


class Resume(Base):
    __tablename__ = "resumes"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
    profile_summary = Column(Text, nullable=True)

    education = Column(JSONB, nullable=False, default=list)
    experience = Column(JSONB, nullable=False, default=list)
    projects = Column(JSONB, nullable=False, default=list)
    hard_skills = Column(JSONB, nullable=False, default=list)
    soft_skills = Column(JSONB, nullable=False, default=list)
    languages = Column(JSONB, nullable=False, default=list)
    hobbies = Column(JSONB, nullable=False, default=list)
    certifications = Column(JSONB, nullable=False, default=list)

    is_active = Column(Boolean, nullable=False, default=True)

    created_at = Column(DateTime, nullable=False, default=func.now())
    updated_at = Column(DateTime, nullable=False, default=func.now(), onupdate=func.now())

    def __repr__(self):
        return f"<Resume(id={self.id}, user_id={self.user_id}, is_active={self.is_active})>"