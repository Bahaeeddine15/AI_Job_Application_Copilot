import asyncio
from typing import Dict
from app.services.ai_service import AIService
from app.models.Resume import Resume

#this is the main service that will handle the analysis of the resume and job description.
#  It will call the AIService to get the extracted skills, keywords, similarity score, improvement suggestions, and cover letter.
#  It will also compare the extracted skills with the job keywords to determine which skills are matched and which are missing.
#  This service is used in the analyze endpoint of the application router.
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

        resume_text_lower = resume.lower()

        # dedupe extracted skills and normalize to lowercase for comparisons
        skills = [s.strip() for s in skills if s and s.strip()]
        skills = list(dict.fromkeys(skills))  # preserve order, remove duplicates
        skills_lower = [s.lower() for s in skills]

        matched = []
        for k in keywords:
            kl = k.lower().strip()
            if not kl:
                continue

            # 1) exact/substring match against extracted skills
            matches_skill_list = any(kl == s or kl in s for s in skills_lower)

            # 2) literal presence anywhere in the resume text (covers project descriptions)
            present_in_text = kl in resume_text_lower

            if matches_skill_list or present_in_text:
                matched.append(k)

        matched_lower = {m.lower() for m in matched}
        missing = [k for k in keywords if k.lower() not in matched_lower]

        return {
            "match_score": round(float(score), 2),
            "extracted_resume_skills": skills,
            "job_keywords": keywords,
            "matched_skills": matched,
            "missing_skills": missing,
            "cover_letter": cover_letter,
            "improvement_suggestions": suggestions,
        }
    
    
    