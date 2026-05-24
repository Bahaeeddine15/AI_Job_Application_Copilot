from sqlalchemy.orm import Session
from app.models.Resume import Resume
from app.models.Users import Users
from app.schemas.resume_schema import ResumeCreate
from io import BytesIO
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.units import cm


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
            title=payload.title
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
                "title": resume.title,
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
    
    @staticmethod
    def generate_resume_pdf(resume, user):
        buffer = BytesIO()

        doc = SimpleDocTemplate(
            buffer,
            pagesize=A4,
            rightMargin=2 * cm,
            leftMargin=2 * cm,
            topMargin=2 * cm,
            bottomMargin=2 * cm,
        )
        styles = getSampleStyleSheet()

        title_style = ParagraphStyle(
            "TitleStyle",
            parent=styles["Title"],
            fontSize=22,
            textColor=colors.HexColor("#343434"),
            spaceAfter=10,
        )

        section_style = ParagraphStyle(
            "SectionStyle",
            parent=styles["Heading2"],
            fontSize=14,
            textColor=colors.HexColor("#623528"),
            spaceBefore=14,
            spaceAfter=6,
        )
        body_style = ParagraphStyle(
            "BodyStyle",
            parent=styles["BodyText"],
            fontSize=10,
            leading=14,
            textColor=colors.HexColor("#343434"),
        )

        story = []

        full_name = f"{user.first_name} {user.last_name}"

        story.append(Paragraph(full_name, title_style))

        contact = []

        if user.professional_email:
            contact.append(user.professional_email)
        else:
            contact.append(user.email)

        if user.phone_number:
            contact.append(user.phone_number)
        if user.city or user.country:
            contact.append(", ".join(filter(None, [user.city, user.country])))
        if user.linkedin_url:
            contact.append(user.linkedin_url)

        story.append(Paragraph(" | ".join(contact), body_style))
        story.append(Spacer(1, 12))

        if resume.profile_summary:
            story.append(Paragraph("Profile", section_style))
            story.append(Paragraph(resume.profile_summary, body_style))

        if resume.education:
            story.append(Paragraph("Education", section_style))
            for item in resume.education:
                text = f"<b>{item.get('degree', '')}</b> - {item.get('institution', '')}<br/>"
                text += f"{item.get('field', '')} | {item.get('start_date', '')} - {item.get('end_date', '')}<br/>"
                text += item.get("description", "")
                story.append(Paragraph(text, body_style))
                story.append(Spacer(1, 6))

        if resume.experience:
            story.append(Paragraph("Experience", section_style))
            for item in resume.experience:
                text = f"<b>{item.get('title', '')}</b> - {item.get('company', '')}<br/>"
                text += f"{item.get('location', '')} | {item.get('start_date', '')} - {item.get('end_date', '')}<br/>"
                text += item.get("description", "")
                story.append(Paragraph(text, body_style))
                story.append(Spacer(1, 6))

        if resume.projects:
            story.append(Paragraph("Projects", section_style))
            for item in resume.projects:
                text = f"<b>{item.get('title', '')}</b><br/>"
                text += item.get("description", "")
                if item.get("technologies"):
                    text += f"<br/><i>Technologies: {item.get('technologies')}</i>"
                story.append(Paragraph(text, body_style))
                story.append(Spacer(1, 6))

        if resume.hard_skills:
            story.append(Paragraph("Hard Skills", section_style))
            story.append(Paragraph(", ".join(resume.hard_skills), body_style))

        if resume.soft_skills:
            story.append(Paragraph("Soft Skills", section_style))
            story.append(Paragraph(", ".join(resume.soft_skills), body_style))

        if resume.languages:
            story.append(Paragraph("Languages", section_style))
            languages = [
                f"{item.get('name', '')} ({item.get('level', '')})"
                for item in resume.languages
            ]
            story.append(Paragraph(", ".join(languages), body_style))

        if resume.certifications:
            story.append(Paragraph("Certifications", section_style))
            for item in resume.certifications:
                text = f"<b>{item.get('name', '')}</b>"
                if item.get("issuer"):
                    text += f" - {item.get('issuer')}"
                if item.get("issue_date"):
                    text += f" ({item.get('issue_date')})"
                story.append(Paragraph(text, body_style))

        if resume.hobbies:
            story.append(Paragraph("Hobbies", section_style))
            story.append(Paragraph(", ".join(resume.hobbies), body_style))

        doc.build(story)

        buffer.seek(0)
        return buffer