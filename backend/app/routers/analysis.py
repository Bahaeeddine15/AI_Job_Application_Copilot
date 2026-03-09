from fastapi import APIRouter
from app.schemas.analysis_schema import JobKeywordsRequest, SimilarityScoreRequest
from app.services.analysis_service import AnalysisService

router = APIRouter(prefix="/api/analysis",
                   tags=["Analysis"])


@router.post("/job-keywords")
def job_keywords(payload: JobKeywordsRequest):
    keywords = AnalysisService.extract_keywords(payload.job_description)

    return {
        "status": "success",
        "data": {
            "keywords": keywords
        }
    }


@router.post("/similarity-score")
def similarity_score(payload: SimilarityScoreRequest):
    score = AnalysisService.calculate_similarity(
        payload.resume,
        payload.job_description
    )

    return {
        "status": "success",
        "data": {
            "similarity_score": score
        }
    }