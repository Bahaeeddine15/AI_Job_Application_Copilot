
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey,func
from app.database.base import Base
class Resume(Base):
	__tablename__ = 'resumes'
	id = Column(Integer, primary_key=True, autoincrement=True)
	user_id = Column(Integer, ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
	content = Column(String, nullable=False)
	created_at = Column(DateTime, nullable=False,default=func.now())

	def __repr__(self):
		return f"<Resume(id={self.id}, user_id={self.user_id}, created_at={self.created_at})>"
