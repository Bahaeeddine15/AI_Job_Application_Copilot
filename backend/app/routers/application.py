from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.models.Analyses import Analyses
from app.models.Users import Users

from app.services.auth_service import get_current_user
from app.schemas.application_schema import (
    AnalyzeRequest,
    CoverLetterRequest,
    OptimizeResumeRequest,
)
from app.services.ai_service import AIService
from app.services.application_service import ApplicationService
from app.services.response_service import error_response, success_response

router = APIRouter(
    prefix="/api/application",
    tags=["Application"],
    dependencies=[Depends(get_current_user)],
)


@router.post("/analyze")
async def analyze_application(
    payload: AnalyzeRequest,
    db: Session = Depends(get_db),
    current_user: Users = Depends(get_current_user),
):
    try:
        analysis_data = await ApplicationService.analyze_resume(
            payload.resume,
            payload.job_description,
        )

        query = db.query(Analyses).filter(Analyses.user_id == current_user.id)
        if payload.analysis_id:
            query = query.filter(Analyses.id == payload.analysis_id)
        analysis_row = query.order_by(Analyses.created_at.desc(), Analyses.id.desc()).first()

        if analysis_row:
            analysis_row.match_score = analysis_data.get("match_score")
            analysis_row.matched_skills = analysis_data.get("matched_skills", [])
            analysis_row.missing_skills = analysis_data.get("missing_skills", [])
            analysis_row.status = "completed"
            db.commit()

        return success_response(data=analysis_data)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/generate-cover-letter")
async def generate_cover_letter_endpoint(
    request: CoverLetterRequest,
    db: Session = Depends(get_db),
    current_user: Users = Depends(get_current_user),
):
    try:
        result = await AIService.generate_cover_letter(
            request.resume,
            request.job_description,
            request.tone,
        )

        query = db.query(Analyses).filter(Analyses.user_id == current_user.id)
        if request.analysis_id:
            query = query.filter(Analyses.id == request.analysis_id)
        analysis_row = query.order_by(Analyses.created_at.desc(), Analyses.id.desc()).first()

        if analysis_row:
            analysis_row.cover_letter = result
            if analysis_row.status == "pending":
                analysis_row.status = "completed"
            db.commit()

        return success_response(
            {"cover_letter": result},
            "Cover letter generated successfully",
        )

    except Exception as e:
        msg = str(e)
        if "PROVIDER_429" in msg or "429" in msg or "RESOURCE_EXHAUSTED" in msg:
            raise HTTPException(status_code=429, detail=f"Cover letter failed: {msg}")
        raise HTTPException(status_code=503, detail=f"Cover letter failed: {msg}")


@router.post("/optimize-resume")
async def optimize_resume_endpoint(request: OptimizeResumeRequest):
    try:
        improvements = await AIService.optimize_resume_content(
            request.resume,
            request.job_description,
        )
        return success_response(
            {"improvements": improvements},
            "Resume optimization suggestions generated",
        )
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Optimize failed: {str(e)}")