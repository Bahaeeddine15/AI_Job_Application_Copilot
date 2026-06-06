from fastapi import APIRouter, Depends, HTTPException
from app.models.Resume import Resume
from app.models.Users import Users
from app.schemas.analysis_schema import JobDescriptionCreate, JobKeywordsRequest, SimilarityScoreRequest
from app.services.ai_service import AIService
from app.services.application_service import ApplicationService
from app.services.response_service import error_response, success_response
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


#this endpoint is defined to get the latest job description 
#unlike the others this endpoint is used in the front 
@router.get("/latest-job-description")
async def get_latest_job_description(
    db=Depends(get_db), #this is the db session that we will use to query the db 
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

#this endpoint is fornthe extraction of keywords from the job description.
# it s usd to test the fct before integrating it into the analyse endpoint

@router.post("/job-keywords")
async def job_keywords(payload: JobKeywordsRequest):
    keywords = await AIService.extract_keywords(payload.job_description)
    return success_response(data={"keywords": keywords})

# This endpoint will return the similarity score between the resume and the job description.
#  The score will be a float between 0 and 1, where 1 means a perfect match and 0 means no match at all.
#this is just for testing the similarity score function in the AIService. 
# We will use this endpoint to test the similarity score function before integrating it into the analyze endpoint. 
# This will allow us to test the similarity score function independently and make sure it is working correctly before we use it in the analyze endpoint.
@router.post("/similarity-score")
async def similarity_score(payload: SimilarityScoreRequest):
    result = await AIService.similarity_score(
        payload.resume,
        payload.job_description
    )
    return success_response(data=result)




# This endpoint will be used to save the job description for the analysis. 
# The job description will be linked to the latest active resume of the user.
#  If there is no active resume, we will return an error message asking the user to upload and save their resume before submitting a job description.
@router.post("/job-description/submit")
async def save_job_description(
    payload: JobDescriptionCreate,
    db=Depends(get_db),
    current_user: Users = Depends(get_current_user)
):
    current_resume = ResumeService.get_active_resume(db, current_user.id)

    # Evite d'insérer resume_id=None (interdit par le modèle Analyses)
    if not current_resume:
        return error_response("Please upload and save your resume before submitting a job description.", 400)
       

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

# This endpoint will return the analysis history for the current user, including pagination support.
#  The analyses will be ordered by created_at in descending order, so the most recent analyses will be returned first.
#  Each analysis will include the job description, match score, matched skills, missing skills, cover letter, status, and created_at timestamp.
@router.get("/history")
async def get_history(
    page: int = 1,
    limit: int = 10,
    db=Depends(get_db),
    current_user: Users = Depends(get_current_user)
):
    page = max(page, 1)
    limit = max(min(limit, 50), 1)
    offset = (page - 1) * limit

    query = db.query(Analyses).filter(Analyses.user_id == current_user.id)

    total = query.count()

    analyses = (
        query
        .order_by(Analyses.created_at.desc(), Analyses.id.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )

    return success_response(
        data={
            "items": [
                {
                    "id": a.id,
                    "resume_id": a.resume_id,
                    "job_description": a.job_description,
                    "match_score": a.match_score,
                    "matched_skills": a.matched_skills or [],
                    "missing_skills": a.missing_skills or [],
                    "cover_letter": a.cover_letter,
                    "status": a.status,
                    "created_at": a.created_at,
                }
                for a in analyses
            ],
            "page": page,
            "limit": limit,
            "total": total,
            "pages": (total + limit - 1) // limit,
        }
    )