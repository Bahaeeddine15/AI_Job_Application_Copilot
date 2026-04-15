from typing import Dict
from app.services.ai_service import AIService


class ApplicationService:

    @staticmethod
    async def analyze_resume(resume: str, job_description: str) -> Dict:
        skills = await AIService.extract_skills(resume)
        keywords = await AIService.extract_keywords(job_description)

        matched = [s for s in skills if s.lower() in [k.lower() for k in keywords]]
        missing = [k for k in keywords if k.lower() not in [s.lower() for s in skills]]

        score = await AIService.similarity_score(resume= resume,job_description= job_description)

        return {
            "match_score": round(score, 2),
            "matched_skills": matched,
            "missing_skills": missing
        }
