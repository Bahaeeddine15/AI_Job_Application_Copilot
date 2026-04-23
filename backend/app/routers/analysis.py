from fastapi import APIRouter, Depends, HTTPException
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


@router.get("/latest-job-description")
async def get_latest_job_description(
    db=Depends(get_db),
    current_user: Users = Depends(get_current_user)
):
    latest_analysis = (
        db.query(Analyses)
        .filter(Analyses.user_id == current_user.id)
        .order_by(Analyses.id.desc())
        .first()
    )

    if not latest_analysis:
        return {
            "status": "success",
            "data": None,
            "message": "No job description found"
        }

    return {
        "status": "success",
        "data": {
            "id": latest_analysis.id,
            "job_description": latest_analysis.job_description,
            "created_at": latest_analysis.created_at
        }
    }


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
async def save_job_description(
    payload: JobDescriptionCreate,
    db=Depends(get_db),
    current_user: Users = Depends(get_current_user)
):
    current_resume = (
        db.query(Resume)
        .filter(Resume.user_id == current_user.id)
        .order_by(Resume.created_at.desc(), Resume.id.desc())
        .first()
    )

    # Evite d'insérer resume_id=None (interdit par le modèle Analyses)
    if not current_resume:
        raise HTTPException(
            status_code=400,
            detail="Please upload and save your resume before submitting a job description."
        )

    try:
        analysis = Analyses(
            user_id=current_user.id,
            resume_id=current_resume.id,
            job_description=payload.job_description,
            status="pending"
        )
        db.add(analysis)
        db.commit()
        db.refresh(analysis)
    except Exception:
        db.rollback()
        raise

    return success_response(
        data={
            "id": analysis.id,
            "message": "Job description saved successfully"
        }
    )