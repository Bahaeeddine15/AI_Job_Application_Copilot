import api from "./api";

const BASE_URL = api.defaults.baseURL; 


export const submitJobDescription = async (jobDescription) => {
  const response = await api.post(`${BASE_URL}/api/analysis/job-description/submit`, {
    job_description: jobDescription,
  });
  return response.data;
};

