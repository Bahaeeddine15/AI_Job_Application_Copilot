from pydantic import BaseModel, Field
from typing import List, Optional



# Sub-schemas


class EducationItem(BaseModel):
    institution: str
    degree: Optional[str] = None
    field: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    description: Optional[str] = None


class ExperienceItem(BaseModel):
    title: str
    company: str
    location: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    description: Optional[str] = None


class ProjectItem(BaseModel):
    title: str
    description: Optional[str] = None
    technologies: Optional[str] = None


class LanguageItem(BaseModel):
    name: str
    level: Optional[str] = None


class CertificationItem(BaseModel):
    name: str
    issuer: Optional[str] = None
    issue_date: Optional[str] = None



# Main Resume Schema


class ResumeCreate(BaseModel):
    profile_summary: Optional[str] = None

    education: List[EducationItem] = []
    experience: List[ExperienceItem] = []
    projects: List[ProjectItem] = []

    hard_skills: List[str] = []
    soft_skills: List[str] = []

    languages: List[LanguageItem] = []
    hobbies: List[str] = []
    certifications: List[CertificationItem] = []



# Response Schema


class ResumeResponse(BaseModel):
    id: int
    user_id: int

    profile_summary: Optional[str]

    education: List[EducationItem]
    experience: List[ExperienceItem]
    projects: List[ProjectItem]

    hard_skills: List[str]
    soft_skills: List[str]

    languages: List[LanguageItem]
    hobbies: List[str]
    certifications: List[CertificationItem]

    is_active: bool

    class Config:
        from_attributes = True  # for SQLAlchemy