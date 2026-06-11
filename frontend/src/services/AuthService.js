import api from "./api";
import { Platform } from "react-native";

const TOKEN_KEY = "access_token";

// Charge SecureStore seulement sur mobile
const SecureStore = Platform.OS === "web" ? null : require("expo-secure-store");

const saveToken = async (token) => {
  if (Platform.OS === "web") {
    window.localStorage.setItem(TOKEN_KEY, token);
    return;
  }
  await SecureStore.setItemAsync(TOKEN_KEY, token);
};

const removeToken = async () => {
  if (Platform.OS === "web") {
    window.localStorage.removeItem(TOKEN_KEY);
    return;
  }
  await SecureStore.deleteItemAsync(TOKEN_KEY);
};



export const registerUser = async (payload) => {
  const response = await api.post("/api/auth/register", payload);
  return response.data?.data ?? response.data;
};

export const verifyEmail = async ({ email, code }) => {
  const response = await api.post("/api/auth/verify-email", {
    email,
    code,
  });

  const result = response.data;

  if (result?.status === "error") {
    const error = new Error(result.message || "Email verification failed.");
    error.response = {
      status: result.code,
      data: result,
    };
    throw error;
  }

  return result?.data ?? result;
};
//for now it s not implemented in backend but we can implement it later if needed
export const resendVerificationCode = async ({ email }) => {
  const response = await api.post("/api/auth/resend-verification-code", {
    email,
  });

  const result = response.data;

  if (result?.status === "error") {
    const error = new Error(result.message || "Failed to resend verification code.");
    error.response = {
      status: result.code,
      data: result,
    };
    throw error;
  }

  return result?.data ?? result;
};

export const loginUser = async (email, password) => {
  const response = await api.post("/api/auth/login", { email, password });

  const result = response.data;

  // Your backend error_response returns status: "error"
  if (result?.status === "error") {
    await removeToken();

    const error = new Error(result.message || "Login failed.");
    error.response = {
      status: result.code,
      data: result,
    };

    throw error;
  }

  const token = result?.data?.access_token;

  if (!token) {
    await removeToken();
    throw new Error("Login failed: no access token received.");
  }

  await saveToken(token);

  return result;
};

export const logout = async () => {
  await removeToken();
};

export const getUserProfile = async () => {
  const response = await api.get("/api/auth/profile");
  return response.data?.data;
};

export const updateUserProfile = async (payload) => {
  const response = await api.put("/api/auth/profile", payload);
  return response.data?.data;
};