from fastapi import APIRouter
from app.schemas.analysis_schema import JobKeywordsRequest, SimilarityScoreRequest
from app.services.ai_service import AIService
from app.services.application_service import ApplicationService
from app.services.response_service import success_response

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
    result = await ApplicationService.similarity_score(
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