from fastapi import APIRouter, HTTPException
from app.schemas.application_schema import (
    AnalyzeRequest, 
    CoverLetterRequest, 
    OptimizeRequest
)
# We import the service that will eventually hold your OpenAI logic
from app.services.ai_service import AIService 

"""from fastapi import APIRouter
from app.services.ai_service import extract_skills, similarity_score
from app.services.response_service import success_response"""

router = APIRouter(prefix="/api/application", tags=["Application"])


"""@router.post("/analyze_resume")
def analyze_resume(resume: str, job_description: str):
    skills = extract_skills(resume)
    score = similarity_score(resume, job_description)
    return success_response({"skills": skills, "score": score})"""

@router.post("/analyze")
async def analyze_application(payload: AnalyzeRequest):
    """
    Endpoint to analyze resume vs job description.
    Internally: Extracts skills, compares them, and calculates a match score.
    """
    try:
        # The router 'delegates' the work to the service
        analysis_data = await AIService.analyze_resume_vs_job(
            payload.resume, 
            payload.job_description
        )
        return {
            "status": "success",
            "data": analysis_data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/generate-cover-letter")
async def generate_cover_letter(payload: CoverLetterRequest):
    """
    Endpoint to generate a tailored AI cover letter.
    """
    try:
        letter = await AIService.generate_cover_letter(
            payload.resume, 
            payload.job_description, 
            payload.tone
        )
        return {
            "status": "success",
            "data": {
                "cover_letter": letter
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to generate cover letter")

@router.post("/optimize-resume")
async def optimize_resume(payload: OptimizeRequest):
    """
    Endpoint to suggest resume improvements (verbs, keywords, achievements).
    """
    try:
        suggestions = await AIService.optimize_resume_content(
            payload.resume, 
            payload.job_description
        )
        return {
            "status": "success",
            "data": {
                "improvements": suggestions
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail="Optimization failed")