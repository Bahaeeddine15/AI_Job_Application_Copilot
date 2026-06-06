from app.models.Analyses import Analyses
from io import BytesIO
from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.units import cm
import json
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from xml.sax.saxutils import escape

class AnalysisService:

    @staticmethod
    def get_latest_analysis(db, user_id):
        return (
            db.query(Analyses)
            .filter(Analyses.user_id == user_id)
            .order_by(Analyses.created_at.desc())
            .first()
        )
    
    @staticmethod
    def _capitalize_name(value):
        if not value:
            return ""
        return " ".join(part.capitalize() for part in value.strip().split())

    
    @staticmethod
    def _detect_cover_letter_language(text: str) -> str:
        if not text:
            return "fr"

        lower_text = text.lower()

        english_markers = [
            "dear ",
            "sincerely",
            "i am writing",
            "i would like",
            "i am excited",
            "position",
            "application",
            "my experience",
            "your company",
            "hiring",
            "skills",
        ]

        french_markers = [
            "madame",
            "monsieur",
            "cordialement",
            "je vous",
            "je souhaite",
            "candidature",
            "poste",
            "expérience",
            "compétences",
            "votre entreprise",
        ]

        english_score = sum(1 for marker in english_markers if marker in lower_text)
        french_score = sum(1 for marker in french_markers if marker in lower_text)

        return "en" if english_score > french_score else "fr"


    @staticmethod
    def _parse_cover_letter(raw_cover_letter):
        if not raw_cover_letter:
            return {
                "subject": None,
                "body": "",
                "language": "fr"
            }

        try:
            parsed = json.loads(raw_cover_letter)

            if isinstance(parsed, dict):
                subject = parsed.get("subject")
                body = parsed.get("body") or ""
                language = parsed.get("language")

                if not language:
                    language = AnalysisService._detect_cover_letter_language(
                        f"{subject or ''}\n{body or ''}"
                    )

                return {
                    "subject": subject,
                    "body": body or raw_cover_letter,
                    "language": language
                }

        except Exception:
            pass

        detected_language = AnalysisService._detect_cover_letter_language(raw_cover_letter)

        return {
            "subject": None,
            "body": raw_cover_letter,
            "language": detected_language
        }
    @staticmethod
    def _get_localization(language):
        lang = (language or "fr").lower()

        if lang.startswith("en"):
            return {
                "subject_label": "Subject:",
                "closing": "Sincerely,",
                "postal_placeholder": "Postal code + City",
                "application_for": "Application for the position",
                "full_name_placeholder": "[Your full name]",
                "street_placeholder": "[Your address]",
                "email_placeholder": "[Your email address]",
                "phone_placeholder": "[Your phone number]",
                "company_name": "[Company name]",
                "hiring_manager": "[Hiring manager / Recruiter name]",
                "hiring_position": "[Recruiter position]",
                "company_address": "[Company address]",
                "body_missing": "[The body of the cover letter is not available]",
                "job_title": "[Job title]",
            }

        return {
            "subject_label": "Objet :",
            "closing": "Cordialement,",
            "postal_placeholder": "Code postal + Ville",
            "application_for": "Candidature pour le poste",
            "full_name_placeholder": "[Votre nom complet]",
            "street_placeholder": "[Votre adresse]",
            "email_placeholder": "[Votre adresse e-mail]",
            "phone_placeholder": "[Votre numéro de téléphone]",
            "company_name": "[Nom de l'entreprise]",
            "hiring_manager": "[Employeur / Nom du recruteur]",
            "hiring_position": "[Poste du recruteur]",
            "company_address": "[Adresse de l'entreprise]",
            "body_missing": "[Le corps de la lettre n'est pas disponible]",
            "job_title": "[Intitulé du poste]",
        }

    @staticmethod
    def generate_cover_letter_pdf(analysis, user):
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

        normal_style = ParagraphStyle(
            "CoverNormal",
            parent=styles["Normal"],
            fontSize=10.5,
            leading=16,
            textColor=colors.HexColor("#222222"),
            spaceAfter=6,
        )

        company_style = ParagraphStyle(
            "CompanyBlock",
            parent=styles["Normal"],
            fontSize=10.5,
            leading=16,
            alignment=2,  # 0 left, 1 center, 2 right
            textColor=colors.HexColor("#222222"),
            spaceAfter=6,
        )

        subject_style = ParagraphStyle(
            "CoverSubject",
            parent=styles["Normal"],
            fontSize=11,
            leading=16,
            textColor=colors.HexColor("#222222"),
            spaceBefore=12,
            spaceAfter=12,
            fontName="Helvetica-Bold",
        )

        signature_style = ParagraphStyle(
            "CoverSignature",
            parent=styles["Normal"],
            fontSize=10.5,
            leading=16,
            textColor=colors.HexColor("#222222"),
            fontName="Helvetica-Bold",
            spaceBefore=8,
        )

        story = []

        parsed = AnalysisService._parse_cover_letter(analysis.cover_letter)
        loc = AnalysisService._get_localization(parsed.get("language"))

        first_name = AnalysisService._capitalize_name(getattr(user, "first_name", ""))
        last_name = AnalysisService._capitalize_name(getattr(user, "last_name", ""))
        full_name = f"{first_name} {last_name}".strip() or loc["full_name_placeholder"]

        street_address = loc["street_placeholder"]

        city = getattr(user, "city", None)
        country = getattr(user, "country", None)

        postal_code_city = ", ".join([v for v in [city, country] if v]) or loc["postal_placeholder"]
        
        professional_email = getattr(user, "professional_email", None)
        account_email = getattr(user, "email", None)
        email = professional_email or account_email or loc["email_placeholder"]

        phone = getattr(user, "phone_number", None) or loc["phone_placeholder"]

        company_name = loc["company_name"]
        hiring_manager_name = loc["hiring_manager"]
        hiring_manager_position = loc["hiring_position"]
        company_address = loc["company_address"]

        subject = parsed.get("subject") or f'{loc["application_for"]} {loc["job_title"]}'
        body_text = parsed.get("body") or loc["body_missing"]

    

        # Candidate block
        candidate_lines = [
            full_name,
            street_address,
            postal_code_city,
            email,
            phone,
        ]

        for line in candidate_lines:
            story.append(Paragraph(escape(str(line)), normal_style))

        story.append(Spacer(1, 14))

        # Company block
        company_lines = [
            company_name,
            hiring_manager_name,
            hiring_manager_position,
            company_address,
        ]

        for line in company_lines:
            story.append(Paragraph(escape(str(line)), company_style))

        story.append(Spacer(1, 14))

        # Subject
        story.append(
            Paragraph(
                f"<b>{escape(loc['subject_label'])}</b> {escape(str(subject))}",
                subject_style,
            )
        )

        # Body paragraphs
        paragraphs = [
            p.strip()
            for p in str(body_text).split("\n")
            if p.strip()
        ]

        for paragraph in paragraphs:
            story.append(Paragraph(escape(paragraph), normal_style))
            story.append(Spacer(1, 6))

        story.append(Spacer(1, 12))

        # Closing

        story.append(Paragraph(escape(loc["closing"]), normal_style))
        story.append(Paragraph(escape(full_name), signature_style))

        doc.build(story)

        buffer.seek(0)
        return buffer