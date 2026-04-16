from fastapi import APIRouter, Depends, HTTPException
from app.services.auth_service import get_current_user
from app.schemas.application_schema import (
    AnalyzeRequest, 
    CoverLetterRequest, 
    OptimizeResumeRequest
)
# We import the service that will eventually hold your OpenAI logic
from app.services.ai_service import AIService
from app.services.application_service import ApplicationService
from app.services.response_service import error_response, success_response 

router = APIRouter(prefix="/api/application", tags=["Application"], dependencies=[Depends(get_current_user)])


@router.post("/analyze")
async def analyze_application(payload: AnalyzeRequest):
    """
    Endpoint to analyze resume vs job description.
    Internally: Extracts skills, compares them, and calculates a match score.
    """
    try:
        # The router 'delegates' the work to the service
        analysis_data = await ApplicationService.analyze_resume(
            payload.resume, 
            payload.job_description
        )
        return success_response(data=analysis_data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/generate-cover-letter")
async def generate_cover_letter_endpoint(request: CoverLetterRequest):
    try:
        result = await AIService.generate_cover_letter(
            request.resume,
            request.job_description,
            request.tone
        )

        return success_response(
            {"cover_letter": result},
            "Cover letter generated successfully"
        )

    except Exception as e:
        return error_response(message="AI service is temporarily unavailable. Please try again shortly.", code=503)
    
@router.post("/optimize-resume")
async def optimize_resume_endpoint(request: OptimizeResumeRequest):
    try:
        improvements = await AIService.optimize_resume_content(
            request.resume,
            request.job_description
        )

        return success_response(
            {"improvements": improvements},
            "Resume optimization suggestions generated"
        )

    except Exception as e:
        return error_response(message="AI service is temporarily unavailable. Please try again shortly.", code=503)