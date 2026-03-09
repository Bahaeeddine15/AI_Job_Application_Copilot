from typing import List, Tuple

class AIService:
    @staticmethod
    async def analyze_resume_vs_job(resume: str, job_description: str) -> dict:
        """
        Connects the internal logic to return the structure 
        expected by the /application/analyze router.
        """
        skills = extract_skills(resume)
        matched, missing = compare_skills(skills, job_description)
        score = similarity_score(resume, job_description)
        
        return {
            "match_score": int(score * 100), # Convert 0.78 to 78
            "matched_skills": matched,
            "missing_skills": missing
        }

    @staticmethod
    async def generate_cover_letter(resume: str, job_description: str, tone: str = "professional") -> str:
        # Mocking the AI response
        return f"Dear Hiring Manager,\n\nI am excited to apply for this role. My skills include Python and FastAPI.\n\nBest regards,\nCandidate"

    @staticmethod
    async def optimize_resume_content(resume: str, job_description: str) -> List[str]:
        # Mocking optimization suggestions
        return [
            "Use measurable achievements (e.g., 'Improved speed by 20%')",
            "Add missing keywords: Docker, AWS",
            "Quantify your results in the experience section"
        ]

# --- Internal Helper Functions (Keep these below the class) ---

def extract_skills(resume: str) -> List[str]:
    return ["Python", "FastAPI", "SQL"]

def compare_skills(skills: List[str], job_description: str) -> Tuple[List[str], List[str]]:
    job_keywords = job_description.lower().split()
    matched = [skill for skill in skills if skill.lower() in job_keywords]
    missing = [skill for skill in skills if skill.lower() not in job_keywords]
    return matched, missing

def similarity_score(resume: str, job_description: str) -> float:
    matched, _ = compare_skills(extract_skills(resume), job_description)
    skills = extract_skills(resume)
    return len(matched) / len(skills) if skills else 0.0