from fastapi import APIRouter
from app.schemas.resume_schema import ResumeRequest, SkillsResponse, SummaryResponse
from app.services.response_service import success_response

router = APIRouter(prefix="/api/resume", tags=["Resume"])

@router.post("/extract-skills", response_model=dict) # You can even use your response schemas here
async def extract_skills(payload: ResumeRequest):
    fake_skills = ["Python", "React", "SQL"]
    return success_response(data={"skills": fake_skills})

@router.post("/summarize", response_model=dict)
async def summarize_resume(payload: ResumeRequest):
    fake_summary = "Full-stack developer with experience in modern technologies."
    return success_response(data={"summary": fake_summary})