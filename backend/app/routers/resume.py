from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(
    prefix="/api/resume",
    tags=["Resume"]
)


# ===== Request Schema =====
class ResumeRequest(BaseModel):
    resume: str


# ===== Extract Skills =====
@router.post("/extract-skills")
async def extract_skills(request: ResumeRequest):

    # logique temporaire
    fake_skills = ["Python", "React", "SQL"]

    return {
        "status": "success",
        "data": {
            "skills": fake_skills
        }
    }


# ===== Summarize Resume =====
@router.post("/summarize")
async def summarize_resume(request: ResumeRequest):

    fake_summary = "Full-stack developer with experience in modern technologies."

    return {
        "status": "success",
        "data": {
            "summary": fake_summary
        }
    }