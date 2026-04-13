from typing import Dict
from app.services.ai_service import AIService


class ApplicationService:

    @staticmethod
    async def analyze_resume(resume: str, job_description: str) -> Dict:
        skills = await AIService.extract_skills(resume)
        keywords = await AIService.extract_keywords(job_description)

        matched = [s for s in skills if s.lower() in [k.lower() for k in keywords]]
        missing = [k for k in keywords if k.lower() not in [s.lower() for s in skills]]

        score = len(matched) / len(keywords) if keywords else 0

        return {
            "match_score": round(score, 2),
            "matched_skills": matched,
            "missing_skills": missing
        }

    @staticmethod
    async def similarity_score(resume: str, job_description: str) -> Dict:
        skills = await AIService.extract_skills(resume)
        keywords = await AIService.extract_keywords(job_description)

        matched = [s for s in skills if s.lower() in [k.lower() for k in keywords]]

        score = len(matched) / len(keywords) if keywords else 0

        return {
            "similarity_score": round(score, 2)
        }
    @staticmethod
    async def get_similarity_score(resume: str, job_description: str) -> Dict:
        skills = await AIService.extract_skills(resume)
        job_keywords = await AIService.extract_keywords(job_description)

        matched = [s for s in skills if s.lower() in [k.lower() for k in job_keywords]]

        if len(job_keywords) == 0:
            score = 0
        else:
            score = len(matched) / len(job_keywords)

        return {
            "similarity_score": round(score, 2)
        }