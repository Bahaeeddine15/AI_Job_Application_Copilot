from fastapi import APIRouter, HTTPException, Depends
from requests import Session

from app.services.resume_service import ResumeService
from app.services.auth_service import get_current_user
from app.models.Users import Users
from app.database.connection import get_db
from app.schemas.resume_schema import   ResumeCreate
from app.services.response_service import success_response 
from app.services.ai_service import AIService


router = APIRouter(prefix="/api/resume", tags=["Resume"])

@router.get("/latest")
async def get_latest_resume(
    db: Session = Depends(get_db),
    current_user: Users = Depends(get_current_user)
):
    latest_resume = ResumeService.get_active_resume(db, current_user.id)

    if not latest_resume:
        return {
            "status": "success",
            "data": None,
            "message": "No resume found"
        }

    return {
        "status": "success",
        "data": {
            "id": latest_resume.id,
            "user_id": latest_resume.user_id,
            "profile_summary": latest_resume.profile_summary,
            "education": latest_resume.education,
            "experience": latest_resume.experience,
            "projects": latest_resume.projects,
            "hard_skills": latest_resume.hard_skills,
            "soft_skills": latest_resume.soft_skills,
            "languages": latest_resume.languages,
            "hobbies": latest_resume.hobbies,
            "certifications": latest_resume.certifications,
            "is_active": latest_resume.is_active,
            "created_at": latest_resume.created_at,
            "updated_at": latest_resume.updated_at
        }
    }

@router.post("/extract-skills")
async def extract_skills(
    db: Session = Depends(get_db),
    current_user: Users = Depends(get_current_user),
):
    try:
        resume = ResumeService.get_active_resume(db, current_user.id)

        if not resume:
            raise HTTPException(status_code=404, detail="No active resume found")

        resume_text = ResumeService.build_resume_text(resume)

        skills = await AIService.extract_skills(resume_text)

        return {"status": "success", "data": {"skills": skills}}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    


#this endpoint is for saving the validated resume text to the database after extraction and any necessary cleaning. It assumes a user_id of 1 for now, but this should be replaced with the actual logged-in user's ID in a real application.
@router.post("/save")
async def save_resume(
    payload: ResumeCreate,
    db: Session = Depends(get_db),
    current_user: Users = Depends(get_current_user),
):
    return ResumeService.save_resume(db, current_user, payload)
    