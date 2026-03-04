from fastapi import APIRouter , Body

router = APIRouter(
    prefix="/api/analysis",
    tags=["Analysis"]
)

@router.post("/job-keywords")
def job_keywords(playload: dict = Body(...)):
     
     """
     
    Purpose: Extract top keywords from job description.
    Request:
      { "job_description": "string" }
    Response:
      { "status": "success", "data": { "keywords": [...] } }
    """
     # Placeholder (you'll replace with real logic later)

     return {
        "status": "success",
        "data": {
            "keywords": []
        }
    }

@router.post("/similarity-score")
def similarity_score(payload: dict = Body(...)):
    """
    Purpose: Return similarity score only (lighter endpoint).
    Request:
      { "resume": "string", "job_description": "string" }
    Response:
      { "status": "success", "data": { "similarity_score": 0.82 } }
    """
    # Placeholder (you'll replace with real logic later)
    return {
        "status": "success",
        "data": {
            "similarity_score": 0.0
        }
    }