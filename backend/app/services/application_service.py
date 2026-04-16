import asyncio
from typing import Dict
from app.services.ai_service import AIService
from app.services.file_service import FileService
from app.models.Resume import Resume

class ApplicationService:

    @staticmethod
    async def analyze_resume(resume: str, job_description: str) -> Dict:
        # Run all AI calls concurrently to save massive amounts of time
        skills_task = AIService.extract_skills(resume)
        keywords_task = AIService.extract_keywords(job_description)
        score_task = AIService.similarity_score(resume, job_description)
        suggestions_task = AIService.optimize_resume_content(resume, job_description)

        # Await them all at once
        skills, keywords, score, suggestions = await asyncio.gather(
            skills_task, 
            keywords_task, 
            score_task, 
            suggestions_task
        )

        # Programmatically find matched and missing based on the AI's extracted lists
        resume_skills_lower = [s.lower() for s in skills]
        
        # A skill is matched if the job keyword appears in the resume skills
        matched = [k for k in keywords if k.lower() in resume_skills_lower]
        # A skill is missing if the job keyword does NOT appear in the resume skills
        missing = [k for k in keywords if k.lower() not in resume_skills_lower]

        return {
            "match_score": round(score, 2),
            "extracted_resume_skills": skills,
            "job_keywords": keywords,
            "matched_skills": matched,
            "missing_skills": missing,
            "improvement_suggestions": suggestions
        }

    @staticmethod
    async def upload_resume(file_bytes: bytes, user_id: int, db):

        # Step 2 → extract text
        text = FileService.extract_text_from_pdf(file_bytes)

        # Step 3 → store in DB
        resume = Resume(
            user_id=user_id,
            content=text
        )

        db.add(resume)
        db.commit()
        db.refresh(resume)

        return resume