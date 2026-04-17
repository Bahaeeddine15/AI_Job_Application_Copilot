import api from "./api";

const BASE_URL = "http://192.168.18.47:8000"; 
// Android emulator
// If using a real phone, replace with your PC local IP:
// const BASE_URL = "http://192.168.1.5:8000";

export const submitJobDescription = async (jobDescription) => {
  const response = await api.post(`${BASE_URL}/api/analysis/job-description/submit`, {
    job_description: jobDescription,
  });
  return response.data;
};

