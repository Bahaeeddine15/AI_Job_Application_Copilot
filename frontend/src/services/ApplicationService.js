
import api, {API_URL} from "./api";
import { Platform } from "react-native";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import * as SecureStore from "expo-secure-store";


export const getLatestResume = async () => {
  const response = await api.get("/api/resume/latest");
  return response.data?.data;
};

export const getLatestJobDescription = async () => {
  const response = await api.get("/api/analysis/latest-job-description", {
    params: { t: Date.now() }, // cache-buster
    headers: {
      "Cache-Control": "no-cache",
      Pragma: "no-cache",
      Expires: "0",
    },
  });
  return response.data?.data;
};

// IMPORTANT: backend /api/application/analyze no longer expects request body
//export const analyzeApplication = async () => {
 // const response = await api.post("/api/application/analyze");
//  return response.data?.data;
//};

export const analyzeApplication = async ({ resume, jobDescription, analysisId }) => {
  const response = await api.post("/api/application/analyze", {
    resume,
    job_description: jobDescription,
    analysis_id: analysisId ?? null,
  });
  return response.data?.data;
};

const TOKEN_KEY = "access_token";

const getToken = async () => {
  if (Platform.OS === "web") {
    return window.localStorage.getItem(TOKEN_KEY);
  }

  return await SecureStore.getItemAsync(TOKEN_KEY);
};

// backend expects resume: string for cover letter
export const downloadCoverLetterPdf = async (
  analysisId,
  title = "cover_letter"
) => {
  const safeTitle = title.replace(/[^a-z0-9]/gi, "_").toLowerCase();
  const fileName = `${safeTitle}_${analysisId}.pdf`;

  if (Platform.OS === "web") {
    const response = await api.get(
      `/api/analysis/${analysisId}/cover-letter/download`,
      {
        responseType: "blob",
      }
    );

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
  const url = `${API_URL}/api/analysis/${analysisId}/cover-letter/download`;
  const fileUri = FileSystem.cacheDirectory + fileName;

  console.log("Cover letter download URL:", url);

  const result = await FileSystem.downloadAsync(url, fileUri, {
    headers: token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : {},
  });

  console.log("Cover letter download result:", result);

  if (result.status !== 200) {
    throw new Error(`Cover letter download failed with status ${result.status}`);
  }

  const info = await FileSystem.getInfoAsync(result.uri, { size: true });

  console.log("Downloaded cover letter PDF info:", info);

  if (!info.exists || !info.size || info.size <= 0) {
    throw new Error("Downloaded cover letter PDF is empty");
  }

  await Sharing.shareAsync(result.uri, {
    mimeType: "application/pdf",
    UTI: "com.adobe.pdf",
    dialogTitle: "Share cover letter PDF",
  });

  return result.uri;
};

