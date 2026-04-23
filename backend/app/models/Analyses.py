from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Float, Text, ARRAY
from sqlalchemy.sql import func
from .Users import Base


class Analyses(Base):
    __tablename__ = "analyses"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    resume_id = Column(Integer, ForeignKey("resumes.id", ondelete="CASCADE"), nullable=False)
    job_description = Column(Text, nullable=False)
    match_score = Column(Float)
    matched_skills = Column(ARRAY(String))
    missing_skills = Column(ARRAY(String))
    cover_letter = Column(String)
    created_at = Column(DateTime, nullable=False, default=func.now())
    status = Column(String, nullable=False, default="pending")  # pending, completed, failed

    def __repr__(self):
        return f"<Analysis(id={self.id}, user_id={self.user_id}, resume_id={self.resume_id}, match_score={self.match_score})>"