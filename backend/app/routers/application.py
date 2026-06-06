from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.models.Analyses import Analyses
from app.models.Users import Users

from app.services.auth_service import get_current_user
from app.schemas.application_schema import (
    CoverLetterRequest,
    OptimizeResumeRequest,
)
from app.services.ai_service import AIService
from app.services.application_service import ApplicationService
from app.services.response_service import error_response, success_response
from app.services.analysis_service import AnalysisService
from app.services.resume_service import ResumeService   
from app.models.Resume import Resume

router = APIRouter(
    prefix="/api/application",
    tags=["Application"],
    dependencies=[Depends(get_current_user)],
)


@router.post("/analyze")
async def analyze(
    db: Session = Depends(get_db),
    current_user: Users = Depends(get_current_user),
):
    analysis = AnalysisService.get_latest_analysis(db, current_user.id)

    if not analysis:
        return error_response("No analysis found", 404)
    
    active_resume = ResumeService.get_active_resume(db, current_user.id)

    if not active_resume:
        return error_response("Active resume not found", 404)
    
    # Important fix:
    # Always force the analysis to use the latest active resume
    if analysis.status != "completed":
        analysis.resume_id = active_resume.id
        db.commit()
        db.refresh(analysis)

    resume_text = ResumeService.build_resume_text(active_resume)

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

#
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
            return error_response(f"Cover letter failed: {msg}", 429)
        return error_response(f"Cover letter failed: {msg}", 503)


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
        return error_response(f"Optimize failed: {str(e)}", 503)
