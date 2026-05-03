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
from app.services.analysis_service import AnalysisService
from app.services.resume_service import ResumeService
from requests import Session

router = APIRouter(
    prefix="/api/analysis",
    tags=["Analysis"]
)

@router.post("/analyze")
async def analyze(
    db: Session = Depends(get_db),
    current_user: Users = Depends(get_current_user),
):
    analysis = AnalysisService.get_latest_analysis(db, current_user.id)

    if not analysis:
        raise HTTPException(status_code=404, detail="No analysis found")

    resume = (
        db.query(Resume)
        .filter(
            Resume.id == analysis.resume_id,
            Resume.user_id == current_user.id
        )
        .first()
    )

    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")

    resume_text = ResumeService.build_resume_text(resume)

    result = await ApplicationService.analyze_resume(
        resume_text,
        analysis.job_description
    )

    # update same row
    analysis.matched_skills = result["matched_skills"]
    analysis.missing_skills = result["missing_skills"]
    analysis.match_score = result["match_score"]
    analysis.status = "completed"
    analysis.cover_letter = result["cover_letter"]

    db.commit()
    db.refresh(analysis)

    return success_response(data=result)

@router.get("/latest-job-description")
async def get_latest_job_description(
    db=Depends(get_db),
    current_user: Users = Depends(get_current_user)
):
    latest_analysis = AnalysisService.get_latest_analysis(db, current_user.id)

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





@router.post("/job-description/submit")
async def save_job_description(
    payload: JobDescriptionCreate,
    db=Depends(get_db),
    current_user: Users = Depends(get_current_user)
):
    current_resume = ResumeService.get_active_resume(db, current_user.id)

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
            "analysis_id": analysis.id,
            "message": "Job description saved successfully"
        }
    )