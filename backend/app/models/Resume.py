
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from .Users import Base

class Resume(Base):
	__tablename__ = 'resume'
	id = Column(Integer, primary_key=True, autoincrement=True)
	user_id = Column(Integer, ForeignKey('user.id'), nullable=False)
	content = Column(String, nullable=False)
	created_at = Column(DateTime, nullable=False)

	def __repr__(self):
		return f"<Resume(id={self.id}, user_id={self.user_id}, created_at={self.created_at})>"
