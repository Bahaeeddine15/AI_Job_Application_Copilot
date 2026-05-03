from sqlalchemy.orm import Session
from app.models.Resume import Resume
from app.models.Users import Users
from app.schemas.resume_schema import ResumeCreate


class ResumeService:
    @staticmethod
    def save_resume(db: Session, current_user: Users, payload: ResumeCreate):
        # deactivate previous active resumes of this user
        db.query(Resume).filter(
            Resume.user_id == current_user.id,
            Resume.is_active == True
        ).update({"is_active": False})

        resume = Resume(
            user_id=current_user.id,
            profile_summary=payload.profile_summary,
            education=[item.model_dump() for item in payload.education],
            experience=[item.model_dump() for item in payload.experience],
            projects=[item.model_dump() for item in payload.projects],
            hard_skills=payload.hard_skills,
            soft_skills=payload.soft_skills,
            languages=[item.model_dump() for item in payload.languages],
            hobbies=payload.hobbies,
            certifications=[item.model_dump() for item in payload.certifications],
            is_active=True,
        )

        db.add(resume)
        db.commit()
        db.refresh(resume)

        return {
            "status": "success",
            "data": {
                "id": resume.id,
                "user_id": resume.user_id,
                "profile_summary": resume.profile_summary,
                "education": resume.education,
                "experience": resume.experience,
                "projects": resume.projects,
                "hard_skills": resume.hard_skills,
                "soft_skills": resume.soft_skills,
                "languages": resume.languages,
                "hobbies": resume.hobbies,
                "certifications": resume.certifications,
                "is_active": resume.is_active,
                "created_at": resume.created_at,
                "updated_at": resume.updated_at,
            },
        }
    
    @staticmethod
    def get_active_resume(db: Session, user_id: int):
        return db.query(Resume).filter(
            Resume.user_id == user_id,
            Resume.is_active == True
        ).first()
    
    @staticmethod
    def build_resume_text(resume: Resume) -> str:
        parts = []

        if resume.profile_summary:
            parts.append(resume.profile_summary)

        if resume.experience:
            parts.append(str(resume.experience))

        if resume.projects:
            parts.append(str(resume.projects))

        if resume.education:
            parts.append(str(resume.education))

        if resume.hard_skills:
            parts.append(", ".join(resume.hard_skills))

        return "\n\n".join(parts)