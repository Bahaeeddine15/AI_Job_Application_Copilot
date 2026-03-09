from pydantic import BaseModel


class JobKeywordsRequest(BaseModel):
    job_description: str


class SimilarityScoreRequest(BaseModel):
    resume: str
    job_description: str