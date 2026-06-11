from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional

# 1. For the /analyze endpoint
class AnalyzeRequest(BaseModel):
    
    resume_id: int = Field(..., description="The selected resume ID to use for this analysis")

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

class VerifyEmailRequest(BaseModel):
    email: EmailStr
    code: str

class ResendVerificationCodeRequest(BaseModel):
    email: EmailStr