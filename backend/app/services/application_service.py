import asyncio
from typing import Dict
from app.services.ai_service import AIService
from app.services.file_service import FileService
from app.models.Resume import Resume


class ApplicationService:

    @staticmethod
    async def analyze_resume(resume: str, job_description: str) -> Dict:
        # Run AI calls concurrently
        tone="professional"
        skills_task = AIService.extract_skills(resume)
        keywords_task = AIService.extract_keywords(job_description)
        score_task = AIService.similarity_score(resume, job_description)
        suggestions_task = AIService.optimize_resume_content(resume, job_description)
        cover_letter_task = AIService.generate_cover_letter(resume, job_description, tone=tone)

        # Keep partial results even if one call fails
        skills, keywords, score, suggestions, cover_letter = await asyncio.gather(
            skills_task,
            keywords_task,
            score_task,
            suggestions_task,
            cover_letter_task,
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
        if isinstance(cover_letter, Exception):
            cover_letter = "Could not generate cover letter at this time."

        resume_skills_lower = [s.lower() for s in skills]
        matched = [k for k in keywords if k.lower() in resume_skills_lower]
        missing = [k for k in keywords if k.lower() not in resume_skills_lower]

        return {
            "match_score": round(float(score), 2),
            "extracted_resume_skills": skills,
            "job_keywords": keywords,
            "matched_skills": matched,
            "missing_skills": missing,
            "cover_letter": cover_letter,
            "improvement_suggestions": suggestions,
        }

    