"""
Base class for all SQLAlchemy models.
All models should inherit from this Base.
"""
from sqlalchemy.ext.declarative import declarative_base

#this eis the base class for all SQLAlchemy models. All models should inherit from this Base. This allows us to use the same metadata and engine for all models.

Base = declarative_base()