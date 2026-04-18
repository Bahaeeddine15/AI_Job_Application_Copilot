import api from "./api";
import { Platform } from "react-native";

const BASE_URL = api.defaults.baseURL; 


export const uploadResume = async (selectedFile) => {
  const formData = new FormData();
  console.log(formData);
console.log(selectedFile);

  if (Platform.OS === "web") {
    formData.append("file", selectedFile.file);
  } else {
    formData.append("file", {
      uri: selectedFile.uri,
      name: selectedFile.name,
      type: selectedFile.mimeType || "application/pdf",
    });
  }

  const response = await api.post(`${BASE_URL}/api/resume/upload`, formData);

  return response.data;
};


export const saveResumeText = async (validatedText) => {
  const response = await api.post("/api/resume/save", {
    validated_text: validatedText,
  });
  return response.data;
};