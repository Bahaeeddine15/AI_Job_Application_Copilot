import asyncio
from app.services.ai_service import AIService


async def main():
    resume = """
    Python developer with experience in FastAPI, Docker, PostgreSQL, Git, and REST APIs.
    Built backend systems and deployed applications.
    """

    job_description = """
    We are looking for a backend engineer with strong FastAPI, Docker, CI/CD,
    PostgreSQL, and REST API experience.
    """

    print("Testing extract_keywords...")
    keywords = await AIService.extract_keywords(job_description)
    print(keywords)
    print()

    print("Testing extract_skills...")
    skills = await AIService.extract_skills(resume)
    print(skills)
    print()

    print("Testing similarity_score...")
    score = await AIService.similarity_score(resume, job_description)
    print(score)
    print()

    print("Testing generate_cover_letter...")
    cover_letter = await AIService.generate_cover_letter(resume, job_description)
    print(cover_letter)
    print()


asyncio.run(main())