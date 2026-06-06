from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import StreamingResponse
from requests import Session

from fastapi.responses import Response
from app.services.resume_service import ResumeService
from app.services.auth_service import get_current_user
from app.models.Users import Users
from app.database.connection import get_db
from app.schemas.resume_schema import   ResumeCreate
from app.services.response_service import error_response, success_response 
from app.services.ai_service import AIService


from app.models.Resume import Resume




router = APIRouter(prefix="/api/resume", tags=["Resume"])

#this endpoint is for getting the latest (active) resume 
@router.get("/latest")
async def get_latest_resume(
    db: Session = Depends(get_db),
    current_user: Users = Depends(get_current_user)
):
    latest_resume = ResumeService.get_active_resume(db, current_user.id)

    if not latest_resume:
        return error_response("No resume found", 404)

    return success_response(
        data={
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
        })
    

@router.post("/extract-skills")
async def extract_skills(
    db: Session = Depends(get_db),
    current_user: Users = Depends(get_current_user),
):
    try:
        resume = ResumeService.get_active_resume(db, current_user.id)

        if not resume:
            return error_response("No active resume found", 404)
        

        resume_text = ResumeService.build_resume_text(resume)

        skills = await AIService.extract_skills(resume_text)

        return success_response(data={"skills": skills})

    except Exception as e:
        return error_response(f"Error extracting skills: {str(e)}", 500)


#this endpoint is for saving the validated resume text to the database after extraction and any necessary cleaning. It assumes a user_id of 1 for now, but this should be replaced with the actual logged-in user's ID in a real application.
@router.post("/save")
async def save_resume(
    payload: ResumeCreate,
    db: Session = Depends(get_db),
    current_user: Users = Depends(get_current_user),
):
    return ResumeService.save_resume(db, current_user, payload)
    

@router.get("/list")
def get_user_resumes(
    db: Session = Depends(get_db),
    current_user: Users = Depends(get_current_user),
):

    resumes = (
        db.query(Resume)
        .filter(Resume.user_id == current_user.id)
        .order_by(Resume.created_at.desc())
        .all()
    )

    return success_response(
        data=[
            {
                "id": resume.id,
                "title": resume.title or "Untitled resume",
                "profile_summary": resume.profile_summary,
                "is_active": resume.is_active,
                "created_at": resume.created_at,
                "updated_at": resume.updated_at,
            }
            for resume in resumes
        ]
    )

# this endpoint is for downloading the resume as a PDF file. It generates the PDF on the fly using the resume data and returns it as a streaming response with the appropriate headers for file download.
@router.get("/{resume_id}/download")
def download_resume(
    resume_id: int,
    db: Session = Depends(get_db),
    current_user: Users = Depends(get_current_user),
):
    resume = (
        db.query(Resume)
        .filter(
            Resume.id == resume_id,
            Resume.user_id == current_user.id,
        )
        .first()
    )

    if not resume:
        return error_response("Resume not found", 404)

    pdf_buffer = ResumeService.generate_resume_pdf(resume, current_user)
    pdf_buffer.seek(0)
    pdf_bytes = pdf_buffer.getvalue()

    if not pdf_bytes:
        return error_response("Generated PDF is empty", 500)
        

    safe_title = resume.title or "resume"
    safe_title = safe_title.replace(" ", "_").lower()
    filename = f"{safe_title}_{resume.id}.pdf"

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"',
            "Content-Length": str(len(pdf_bytes)),
        },
    )