from pydantic import BaseModel, Field
from typing import List, Optional

# 1. For the /analyze endpoint
class AnalyzeRequest(BaseModel):
    resume: str = Field(..., description="The full text extracted from the resume")
    job_description: str = Field(..., description="The full text of the job posting")
    analysis_id: Optional[int] = None

# 2. For the /generate-cover-letter endpoint
class CoverLetterRequest(BaseModel):
    resume: str
    job_description: str
    tone: str = "professional"
    analysis_id: Optional[int] = None
    #tone: str = "professional"  # Default value if not provided by the mobile app

# 3. For the /optimize-resume endpoint
class OptimizeResumeRequest(BaseModel):
    resume: str
    job_description: str

# 4. Standardizing the Output (Optional but recommended for clean docs)
class StandardResponse(BaseModel):
    status: str = "success"
    data: dict