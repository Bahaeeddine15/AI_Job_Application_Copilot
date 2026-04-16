from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class Users(Base):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True)
    first_name = Column(String)
    last_name = Column(String)
    email = Column(String, unique=True)
    password_hash = Column(String)
    created_at = Column(DateTime)

    def __repr__(self):
        return f"<Users(id={self.id}, first_name='{self.first_name}', last_name='{self.last_name}', email='{self.email}')>"