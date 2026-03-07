class AnalysisService:

    @staticmethod
    def extract_keywords(job_description: str):
        words = job_description.split()
        keywords = words[:5]
        return keywords

    @staticmethod
    def calculate_similarity(resume: str, job_description: str):
        if resume.lower() == job_description.lower():
            return 1.0
        return 0.5