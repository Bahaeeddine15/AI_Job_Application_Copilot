from pydantic import BaseModel, Field
from typing import List


class ResumeRequest(BaseModel): 
    resume: str = Field(
        ...,
        min_length=20,
        description="Full resume text provided by the user"
    )


class SkillsResponse(BaseModel):
    skills: List[str] = Field(
        ...,
        description="List of skills extracted from the resume"
    )


class SummaryResponse(BaseModel):
    summary: str = Field(
        ...,
        description="AI-generated summary of the resume"
    )