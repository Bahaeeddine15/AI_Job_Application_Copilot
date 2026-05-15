import api, {API_URL} from "./api";
import { Platform } from "react-native";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import * as SecureStore from "expo-secure-store";






// import { Platform } from "react-native";

// const BASE_URL = api.defaults.baseURL; 


// export const uploadResume = async (selectedFile) => {
//   const formData = new FormData();
//   console.log(formData);
// console.log(selectedFile);

//   if (Platform.OS === "web") {
//     formData.append("file", selectedFile.file);
//   } else {
//     formData.append("file", {
//       uri: selectedFile.uri,
//       name: selectedFile.name,
//       type: selectedFile.mimeType || "application/pdf",
//     });
//   }

//   const response = await api.post(`${BASE_URL}/api/resume/upload`, formData);

//   return response.data;
// };


// export const saveResumeText = async (validatedText) => {
//   const response = await api.post("/api/resume/save", {
//     validated_text: validatedText,
//   });
//   return response.data;
// };

const TOKEN_KEY = "access_token";

const getToken = async () => {
  if (Platform.OS === "web") {
    return window.localStorage.getItem(TOKEN_KEY);
  }

  return await SecureStore.getItemAsync(TOKEN_KEY);
};

export const getLatestResume = async () => {
  const response = await api.get("/api/resume/latest");
  return response.data?.data;
};

export const saveResume = async (payload) => {
  const response = await api.post("/api/resume/save", payload);
  return response.data?.data ?? response.data;
};

export const extractResumeSkills = async () => {
  const response = await api.post("/api/resume/extract-skills");
  return response.data?.data;
};



export const getAllResumes = async () => {
  const response = await api.get("/api/resume/list");
  return response.data;
};



export const downloadResumePdf = async (
  resumeId,
  title = "resume"
) => {

  
  const safeTitle = title.replace(/[^a-z0-9]/gi, "_").toLowerCase();
  const fileName = `${safeTitle}_${resumeId}.pdf`;

  if (Platform.OS === "web") {
    const response = await api.get(`/api/resume/${resumeId}/download`, {
      responseType: "blob",
    });

    const url = window.URL.createObjectURL(response.data);
    const link = document.createElement("a");

    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    return;
  }

  
  const token = await getToken();
  const url = `${API_URL}/api/resume/${resumeId}/download`;
  const fileUri = FileSystem.cacheDirectory + fileName;

  console.log("Download URL:", url);

  const result = await FileSystem.downloadAsync(url, fileUri, {
    headers: token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : {},
  });

  console.log("Download result:", result);

  if (result.status !== 200) {
    throw new Error(`Download failed with status ${result.status}`);
  }

  const info = await FileSystem.getInfoAsync(result.uri, { size: true });

  console.log("Downloaded PDF info:", info);

  if (!info.exists || !info.size || info.size <= 0) {
    throw new Error("Downloaded PDF is empty");
  }

  await Sharing.shareAsync(result.uri, {
    mimeType: "application/pdf",
    UTI: "com.adobe.pdf",
    dialogTitle: "Share resume PDF",
  });

  return result.uri;
};