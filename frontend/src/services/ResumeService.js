import api from "./api";

const BASE_URL = api.defaults.baseURL ||"http://192.168.18.47:8000"; 
// Android emulator
// If using a real phone, replace with your PC local IP:
// const BASE_URL = "http://192.168.1.5:8000";

export const uploadResume = async (selectedFile) => {
  const formData = new FormData();

  formData.append("file", {
    uri: selectedFile.uri,
    name: selectedFile.name,
    type: selectedFile.mimeType || "application/pdf",
  });

  const response = await api.post(`${BASE_URL}/api/resume/upload`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};


export const saveResumeText = async (validatedText) => {
  const response = await api.post("/api/resume/save", {
    validated_text: validatedText,
  });
  return response.data;
};