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

export const registerUser = async (firstName, lastName, email, password) => {
  const response = await api.post("/api/auth/register", {
    first_name: firstName,
    last_name: lastName,
    email,
    password,
  });
  return response.data;
};

export const loginUser = async (email, password) => {
  const response = await api.post("/api/auth/login", { email, password });

  const token = response?.data?.data?.access_token;
  if (token) {
    await saveToken(token);
  }

  return response.data;
};

export const logout = async () => {
  await removeToken();
};