from fastapi import APIRouter
from app.schemas.analysis_schema import JobKeywordsRequest, SimilarityScoreRequest
from app.services.ai_service import AIService
from app.services.response_service import success_response

router = APIRouter(prefix="/api/analysis",
                   tags=["Analysis"])


@router.post("/job-keywords")
def job_keywords(payload: JobKeywordsRequest):
    keywords = AIService.extract_keywords(payload.job_description)
    return success_response(data={"keywords": keywords})


@router.post("/similarity-score")
def similarity_score(payload: SimilarityScoreRequest):
    score = AIService.similarity_score(
        payload.resume,
        payload.job_description
    )
    return success_response(data={"similarity_score": score})