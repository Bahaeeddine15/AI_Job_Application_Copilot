import asyncio
from typing import Dict
from app.services.ai_service import AIService
from app.services.file_service import FileService
from app.models.Resume import Resume


class ApplicationService:

    @staticmethod
    async def analyze_resume(resume: str, job_description: str) -> Dict:
        # Run AI calls concurrently
        skills_task = AIService.extract_skills(resume)
        keywords_task = AIService.extract_keywords(job_description)
        score_task = AIService.similarity_score(resume, job_description)
        suggestions_task = AIService.optimize_resume_content(resume, job_description)

        # Keep partial results even if one call fails
        skills, keywords, score, suggestions = await asyncio.gather(
            skills_task,
            keywords_task,
            score_task,
            suggestions_task,
            return_exceptions=True,
        )

        # Fallbacks
        if isinstance(skills, Exception):
            skills = []
        if isinstance(keywords, Exception):
            keywords = []
        if isinstance(score, Exception):
            score = 0.0
        if isinstance(suggestions, Exception):
            suggestions = []

        resume_skills_lower = [s.lower() for s in skills]
        matched = [k for k in keywords if k.lower() in resume_skills_lower]
        missing = [k for k in keywords if k.lower() not in resume_skills_lower]

        return {
            "match_score": round(float(score), 2),
            "extracted_resume_skills": skills,
            "job_keywords": keywords,
            "matched_skills": matched,
            "missing_skills": missing,
            "improvement_suggestions": suggestions,
        }

    @staticmethod
    async def upload_resume(file_bytes: bytes, user_id: int, db):
        text = FileService.extract_text_from_pdf(file_bytes)

        resume = Resume(
            user_id=user_id,
            content=text,
        )

        db.add(resume)
        db.commit()
        db.refresh(resume)

        return resume