from fastapi import APIRouter, Depends
from app.models.Resume import Resume
from app.models.Users import Users
from app.schemas.analysis_schema import JobDescriptionCreate, JobKeywordsRequest, SimilarityScoreRequest
from app.services.ai_service import AIService
from app.services.application_service import ApplicationService
from app.services.response_service import success_response
from app.database.connection import get_db
from app.models.Analyses import Analyses
from app.services.auth_service import get_current_user

router = APIRouter(
    prefix="/api/analysis",
    tags=["Analysis"]
)


@router.post("/job-keywords")
async def job_keywords(payload: JobKeywordsRequest):
    keywords = await AIService.extract_keywords(payload.job_description)
    return success_response(data={"keywords": keywords})


@router.post("/similarity-score")
async def similarity_score(payload: SimilarityScoreRequest):
    result = await AIService.similarity_score(
        payload.resume,
        payload.job_description
    )
    return success_response(data=result)


@router.post("/analyze")
async def analyze(payload: SimilarityScoreRequest):
    result = await ApplicationService.analyze_resume(
        payload.resume,
        payload.job_description
    )
    return success_response(data=result)
# This endpoint is for saving the job description to the database for later analysis. It assumes a user_id of 1 for now, but this should be replaced with the actual logged-in user's ID in a real application.
@router.post("/job-description/submit")
async def save_job_description(payload: JobDescriptionCreate, db=Depends(get_db), current_user: Users = Depends(get_current_user)):
    current_resume = (
    db.query(Resume)
    .filter(Resume.user_id == current_user.id)
    .order_by(Resume.created_at.desc())
    .first()
) # Get the most recently uploaded resume for the current user
    analysis = Analyses(
        user_id=current_user.id,  # actual logged-in user ID
        resume_id=current_resume.id if current_resume else None,  #  actual resume ID associated with this job description
        job_description=payload.job_description,
        status='pending'
    )
    db.add(analysis)
    db.commit()
    db.refresh(analysis)
    return success_response(data={"message": "Job description saved successfully"})