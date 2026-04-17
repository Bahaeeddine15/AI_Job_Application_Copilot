from fastapi import APIRouter, Depends
from app.schemas.analysis_schema import JobKeywordsRequest, SimilarityScoreRequest
from app.services.ai_service import AIService
from app.services.application_service import ApplicationService
from app.services.response_service import success_response
from app.database.connection import get_db
from app.models.Analyses import Analyses

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

@router.post("/job-description/submit")
async def save_job_description(payload: JobKeywordsRequest, db=Depends(get_db)):
    analysis = Analyses(
        user_id=1,  # Replace with actual logged-in user ID
        resume_id=1,  # Replace with actual resume ID if needed
        job_description=payload.job_description,
        status='pending'
    )
    db.add(analysis)
    db.commit()
    db.refresh(analysis)
    return success_response(data={"message": "Job description saved successfully"})