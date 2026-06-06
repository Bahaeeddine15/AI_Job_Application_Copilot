from sqlalchemy.orm import Session
from app.models.Resume import Resume
from app.models.Users import Users
from app.schemas.resume_schema import ResumeCreate
from io import BytesIO
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable, KeepTogether
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
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

        # Adjust margins to maximize space for a single page
        doc = SimpleDocTemplate(
            buffer,
            pagesize=A4,
            rightMargin=1.0 * cm,
            leftMargin=1.0 * cm,
            topMargin=1.0 * cm,
            bottomMargin=1.0 * cm,
        )
        
        styles = getSampleStyleSheet()

        # 1. Typography Styles Definitions
        name_style = ParagraphStyle(
            "NameStyle",
            parent=styles["Normal"],
            fontSize=22, # Slightly smaller to save space
            fontName="Helvetica-Bold",
            textColor=colors.HexColor("#222222"),
            alignment=1, # Center
            spaceAfter=8, # Increased space to fix overlap
            leading=24,   # Ensures line height doesn't overlap text below
        )

        contact_style = ParagraphStyle(
            "ContactStyle",
            parent=styles["Normal"],
            fontSize=9.5,
            fontName="Helvetica",
            textColor=colors.HexColor("#555555"),
            alignment=1, # Center
            spaceBefore=0,
            spaceAfter=12,
            leading=12, # Added leading to fix overlap
        )

        section_heading_style = ParagraphStyle(
            "SectionHeadingStyle",
            parent=styles["Normal"],
            fontSize=11.5,
            fontName="Helvetica-Bold",
            textColor=colors.HexColor("#222222"),
            spaceBefore=8,  # Tighter spacing
            spaceAfter=1,
            textTransform='uppercase'
        )

        body_style = ParagraphStyle(
            "BodyStyle",
            parent=styles["Normal"],
            fontSize=9.5, # Slightly smaller to fit 1 page
            fontName="Helvetica",
            leading=12,
            textColor=colors.HexColor("#333333"),
        )
        
        bullet_style = ParagraphStyle(
            "BulletStyle",
            parent=body_style,
            leftIndent=12,
            firstLineIndent=-12,
            spaceBefore=1,
            spaceAfter=1,
        )

        story = []

        # 2. Header (Name and Contact Info)
        full_name = f"{user.first_name} {user.last_name}"
        story.append(Paragraph(full_name.upper(), name_style))

        contact = []
        if user.professional_email:
            contact.append(user.professional_email)
        elif user.email:
             contact.append(user.email)
        if user.phone_number:
            contact.append(user.phone_number)
        if user.city or user.country:
            contact.append(", ".join(filter(None, [user.city, user.country])))
        if user.linkedin_url:
            contact.append(user.linkedin_url) # Output actual URL instead of hardcoded word

        story.append(Paragraph(" • ".join(contact), contact_style))
        
        # Helper function to create section dividers
        def add_section_header(title):
            story.append(Paragraph(title, section_heading_style))
            story.append(HRFlowable(width="100%", thickness=0.8, color=colors.HexColor("#CCCCCC"), spaceAfter=6))

        # Helper function to create left-right aligned rows (e.g., Title on left, Dates on right)
        def get_entry_header(left_text, right_text, bold_left=True):
            left_p = Paragraph(f"<b>{left_text}</b>" if bold_left else left_text, body_style)
            # Right align the date
            right_style = ParagraphStyle('Right', parent=body_style, alignment=2)
            right_p = Paragraph(f"<font color='#555555'>{right_text}</font>", right_style)
            
            # Use a Table to force left and right alignment
            t = Table([[left_p, right_p]], colWidths=['75%', '25%'])
            t.setStyle(TableStyle([
                ('LEFTPADDING', (0,0), (-1,-1), 0),
                ('RIGHTPADDING', (0,0), (-1,-1), 0),
                ('BOTTOMPADDING', (0,0), (-1,-1), 0),
                ('TOPPADDING', (0,0), (-1,-1), 0),
            ]))
            return t

        # 3. Profile Summary
        if resume.profile_summary:
            add_section_header("Professional Summary")
            story.append(Paragraph(resume.profile_summary, body_style))
            story.append(Spacer(1, 6))

        # 4. Education (Moved up before Experience)
        if resume.education:
            add_section_header("Education")
            for item in resume.education:
                item_story = []
                date_str = f"{item.get('start_date', '')} - {item.get('end_date', '')}"
                item_story.append(get_entry_header(f"{item.get('degree', '')} in {item.get('field', '')}", date_str))
                item_story.append(Paragraph(f"<i>{item.get('institution', '')}</i>", body_style))
                
                if item.get('description'):
                    item_story.append(Paragraph(item.get('description'), body_style))
                
                item_story.append(Spacer(1, 4))
                story.append(KeepTogether(item_story))

        # 5. Experience (Moved down after Education)
        if resume.experience:
            add_section_header("Experience")
            for item in resume.experience:
                item_story = []
                date_str = f"{item.get('start_date', '')} - {item.get('end_date', 'Present')}"
                item_story.append(get_entry_header(f"{item.get('title', '')} | <i>{item.get('company', '')}</i>", date_str))
                
                if item.get('location'):
                    item_story.append(Paragraph(f"<font color='#777777'>{item.get('location')}</font>", body_style))
                
                if item.get('description'):
                    # Split description by newlines and create bullets
                    desc_lines = item.get('description').split('\n')
                    for line in desc_lines:
                        if line.strip():
                            item_story.append(Paragraph(f"• {line.strip()}", bullet_style))
                
                item_story.append(Spacer(1, 4))
                # Keep job blocks together so they don't awkwardly split across a page boundary
                story.append(KeepTogether(item_story))


        # 6. Projects
        if resume.projects:
            add_section_header("Projects")
            for item in resume.projects:
                item_story = []
                tech_str = f" ({item.get('technologies')})" if item.get('technologies') else ""
                item_story.append(Paragraph(f"<b>{item.get('title', '')}</b>{tech_str}", body_style))
                if item.get('description'):
                    desc_lines = item.get('description').split('\n')
                    for line in desc_lines:
                        if line.strip():
                            item_story.append(Paragraph(f"• {line.strip()}", bullet_style))
                item_story.append(Spacer(1, 4))
                story.append(KeepTogether(item_story))

        # 7. Skills & Languages
        if resume.hard_skills or resume.soft_skills or resume.languages:
            add_section_header("Skills & Languages")
            skills_story = []
            if resume.hard_skills:
                skills_story.append(Paragraph(f"<b>Technical Skills:</b> {', '.join(resume.hard_skills)}", body_style))
                skills_story.append(Spacer(1, 2))
                
            if resume.soft_skills:
                skills_story.append(Paragraph(f"<b>Soft Skills:</b> {', '.join(resume.soft_skills)}", body_style))
                skills_story.append(Spacer(1, 2))
                
            if resume.languages:
                languages = [f"{item.get('name', '')} ({item.get('level', '')})" for item in resume.languages]
                skills_story.append(Paragraph(f"<b>Languages:</b> {', '.join(languages)}", body_style))
                skills_story.append(Spacer(1, 2))
            
            skills_story.append(Spacer(1, 4))
            story.append(KeepTogether(skills_story))

        # 8. Certifications
        if resume.certifications:
            add_section_header("Certifications")
            cert_story = []
            for item in resume.certifications:
                date_str = f" ({item.get('issue_date')})" if item.get('issue_date') else ""
                issuer_str = f" - <i>{item.get('issuer')}</i>" if item.get('issuer') else ""
                cert_story.append(Paragraph(f"• <b>{item.get('name', '')}</b>{issuer_str}{date_str}", bullet_style))
            cert_story.append(Spacer(1, 4))
            story.append(KeepTogether(cert_story))

        # 9. Hobbies
        if resume.hobbies:
            add_section_header("Interests")
            story.append(Paragraph(", ".join(resume.hobbies), body_style))

        doc.build(story)
        buffer.seek(0)
        return buffer