import api from "./api";

export const getLatestResume = async () => {
  const response = await api.get("/api/resume/latest");
  return response.data?.data;
};

export const getLatestJobDescription = async () => {
  const response = await api.get("/api/analysis/latest-job-description");
  return response.data?.data;
};

export const analyzeApplication = async ({ resume, jobDescription, analysisId }) => {
  const response = await api.post("/api/application/analyze", {
    resume,
    job_description: jobDescription,
    analysis_id: analysisId ?? null,
  });

  // Expected shape: { status, data: { match_score, matched_skills, missing_skills, ... } }
  return response.data?.data;
};

export const generateCoverLetter = async ({
  resume,
  jobDescription,
  tone = "professional",
  analysisId,
}) => {
  const response = await api.post("/api/application/generate-cover-letter", {
    resume: resume,
    job_description: jobDescription,
    tone: tone,
    analysis_id: analysisId ?? null,
  });

  // Expected shape: { status, data: { cover_letter } }
  return response.data?.data;
};