from typing import List, Tuple
from app.core.config import settings
import json
import re
import random
import time
import asyncio
from google import genai
from google.genai import types
from groq import AsyncGroq
from typing import Any, Dict, Optional


class AIService:
    # Initialize the Gemini model once for the entire class to reuse across methods
    # client = genai.Client(api_key=settings.GEMINI_API_KEY.get_secret_value())
    # model_name = "gemini-2.5-flash"
    client = AsyncGroq(api_key=settings.GROQ_API_KEY.get_secret_value())
    model_name = settings.GROQ_MODEL
    
   
    @classmethod
    async def extract_keywords(cls, job_description: str) -> List[str]:
        prompt = f"""
                    You are an AI assistant for job analysis.

                    Extract the most important job keywords from the following job description.

                    Rules:
                    - Return ONLY a valid JSON array
                    - No explanation
                    - No markdown
                    - Keep keywords short and relevant
                    - Maximum 10 keywords

                    Job Description:
                    {job_description}
                """
        text = await cls._generate_text(prompt,temperature=0.0) # api call, here cls refers to the class itself which gives us access to the model nd other class methods
        return cls._extract_json_array(text) # we expect the model to return a text that contains a JSON array of keywords, we use the helper function _extract_json_array to parse that text and get the list of keywords as a python list

    @classmethod
    async def extract_skills(cls, resume: str) -> List[str]:
     prompt = f"""
                    You are an AI assistant for resume analysis.

                    Extract the main technical and professional skills from the following resume.

                    Rules:
                    - Return ONLY a valid JSON array of strings
                    - No explanation
                    - No markdown
                    - Maximum 12 skills
                    - Example output: ["FastAPI", "React", "Project Management"]

                    Resume:
                    {resume}
                """
     text = await cls._generate_text(
        prompt,
        temperature=0.0,
        response_format=None,
    )

     return cls._extract_json_array(text)
    @classmethod
    async def similarity_score(cls, resume: str, job_description: str) -> float:
        prompt = f"""
                    You are an expert ATS (Applicant Tracking System).
                    Calculate the similarity score between the following resume and job description.

                    METHODOLOGY:
                    1. Extract required skills from the Job Description.
                    2. Count how many of those required skills strictly appear in the Resume.
                    3. Base the score primarily on the ratio of required skills matched.
                    4. Slightly adjust up for matching experience years and education.
                    5. Do not hallucinate or assume skills. If a skill is not explicitly stated or clearly implied by a synonym, it is not a match.

                    RULES:
                    - Return ONLY a valid JSON object.
                    - The JSON object must contain exactly one key: "score".
                    - The value must be a numeric float between 0.0 and 1.0.
                    - No explanation, no markdown blocks.
                    - Prefer this exact schema: {{"score": 0.85}}
                    - score should represent match ratio where 1.0 = 100%

                    Resume:
                    {resume}

                    Job Description:
                    {job_description}
                """
        text = await cls._generate_text(prompt,temperature=0.0, response_format={"type": "json_object"})
        try:
            data = json.loads(text)
            raw_score = data.get("score", None)

            if raw_score is None:
                raise ValueError(f"Missing 'score' key in response: {text}")

            # Handle numeric and string values: "0.85", "85", "85%", "0,85"
            if isinstance(raw_score, str):
                cleaned = raw_score.strip().replace("%", "").replace(",", ".")
                score = float(cleaned)
                if "%" in raw_score:
                    score = score / 100.0
            else:
                score = float(raw_score)

            # Normalize 0-100 into 0-1 if needed
            if score > 1.0 and score <= 100.0:
                score = score / 100.0

            if score < 0 or score > 1:
                raise ValueError(f"Score out of range after normalization: {score}")

            return score

        except (ValueError, json.JSONDecodeError):
            # Fallback parser (still validate/normalize)
            score = cls._extract_float(text)
            if score > 1.0 and score <= 100.0:
                score = score / 100.0
            if score < 0 or score > 1:
                raise ValueError(f"Could not parse valid score from response: {text}")
            return score

    @classmethod
    async def generate_cover_letter(cls, resume: str, job_description: str, tone:str) -> str:
        prompt = f"""
                    You are an AI assistant for job applications.

                    Write a professional, concise, tailored cover letter based on the resume and job description below.

                    Rules:
                    - {tone} tone
                    - Clear and natural English
                    - 3 to 5 paragraphs
                    - No placeholders like [Company Name]
                    - Ready to use

                    Resume:
                    {resume}

                    Job Description:
                    {job_description}
                """
        return await cls._generate_text(prompt,temperature=0.7)
    
 #helper functions for parsing Gemini responses

    @classmethod
    async def optimize_resume_content(cls, resume: str, job_description: str) -> List[str]:
        prompt = f"""
                    You are an AI assistant specialized in resume optimization.

                    Analyze the resume and the job description.

                    Return ONLY a JSON array of improvement suggestions.

                    Rules:
                    - Return ONLY a valid JSON array of strings containing improvement suggestions.
                    - No explanation
                    - No markdown
                    - Maximum 6 suggestions
                    - Each suggestion must be short and actionable
                    - Example output: ["Add more quantifiable metrics to your recent role", "Highlight AWS experience"]- Example output: ["Add more quantifiable metrics to your recent role", "Highlight AWS experience"]

                    Resume:
                    {resume}

                    Job Description:
                    {job_description}
                """
        text = await cls._generate_text(prompt,temperature=0.1)
        return cls._extract_json_array(text)

    @staticmethod
    def _extract_json_array(text: str) -> List[str]:
        """
        Try to extract and parse a JSON array from model output.
        Example input:
            '["Python", "FastAPI", "Docker"]'
        """
        try:
            match = re.search(r"\[.*\]", text, re.DOTALL) #looks for something like a JSON array inside the text
            if not match:
                raise ValueError("No JSON array found in response.")

            data = json.loads(match.group(0)) #convert the matched string into a python list , we use groupe(0 ) to get the full match of regex (JSON array  nrmally)

            if not isinstance(data, list):  # check if data is a list
                raise ValueError("Parsed data is not a list.")

            return [str(item).strip() for item in data] #ensure all items inside data are string nd remove extra whitespace

        except Exception as e:
            raise ValueError(f"Failed to parse JSON array: {str(e)}")

    @staticmethod
    def _extract_float(text: str) -> float:
        """
        Extract a float number from model output.
        Example inputs:
            '0.82'
            'The similarity score is 0.82'
        """
        try:
            match = re.search(r"\d+(\.\d+)?", text) #looks for a number in the text, it can be an integer or a decimal (float)
            if not match:
                raise ValueError("No numeric score found in response.")

            score = float(match.group(0)) #d same we get the whole matched number and convert it to a float

            if score < 0 or score > 1:
                raise ValueError("Score is outside valid range [0, 1].")

            return score

        except Exception as e:
            raise ValueError(f"Failed to parse similarity score: {str(e)}")

    @classmethod
    async def _generate_text(
        cls,
        prompt: str,
        *,
        temperature: float = 0.0,
        response_format: Optional[Dict[str, Any]] = None,
        max_attempts: int = 5,
    ) -> str:
        """
        Send prompt to Groq with retries for rate limits/transient outages.
        """
        base_delay = 1.0

        for attempt in range(1, max_attempts + 1):
            try:
                response = await cls.client.chat.completions.create(
                    model=cls.model_name,
                    messages=[{"role": "user", "content": prompt}],
                    temperature=temperature,
                    response_format=response_format,  # e.g. {"type": "json_object"}
                )

                text = (response.choices[0].message.content or "").strip()
                if not text:
                    raise ValueError("Empty response from Groq.")
                return text

            except Exception as e:
                msg = str(e)

                # Groq retryable classes: 429/rate-limit/quota + transient 5xx/service unavailable
                retryable = any(token in msg.upper() for token in [
                    "429",
                    "RATE LIMIT",
                    "RESOURCE_EXHAUSTED",
                    "QUOTA",
                    "503",
                    "502",
                    "504",
                    "UNAVAILABLE",
                    "TIMEOUT",
                ])

                if retryable and attempt < max_attempts:
                    # honor provider hint if present: "Please retry in 10.7s"
                    retry_after = None
                    m = re.search(r"retry in\s+([0-9]+(?:\.[0-9]+)?)s", msg, re.IGNORECASE)
                    if m:
                        retry_after = float(m.group(1))

                    delay = retry_after if retry_after is not None else (
                        base_delay * (2 ** (attempt - 1)) + random.uniform(0, 0.5)
                    )
                    await asyncio.sleep(delay)
                    continue

                # preserve semantic status in error text for router mapping
                if "429" in msg or "RESOURCE_EXHAUSTED" in msg or "RATE LIMIT" in msg.upper():
                    raise Exception(f"PROVIDER_429: {msg}")

                raise Exception(f"PROVIDER_ERROR: {msg}")

# --- Internal Helper Functions (Keep these below the class) ---



def compare_skills(skills: List[str], job_description: str) -> Tuple[List[str], List[str]]:
    job_keywords = job_description.lower().split()
    matched = [skill for skill in skills if skill.lower() in job_keywords]
    missing = [skill for skill in skills if skill.lower() not in job_keywords]
    return matched, missing

