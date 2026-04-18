import axios from "axios";
import { Platform } from "react-native";

// Adapte selon plateforme
const API_URL =
  Platform.OS === "android"
  
    ? "http://ur_ip:8000" // Android 
    : Platform.OS === "ios"
    ? "http://ur_ip:8000" // iPhone physique (IP de ton PC)
    : "http://127.0.0.1:8000"; // Web local

const api = axios.create({ baseURL: API_URL });

// Charge SecureStore seulement sur mobile
const SecureStore = Platform.OS === "web" ? null : require("expo-secure-store");

const getToken = async () => {
  if (Platform.OS === "web") {
    return window.localStorage.getItem("access_token");
  }
  return SecureStore.getItemAsync("access_token");
};

api.interceptors.request.use(
  async (config) => {
    try {
      const token = await getToken();
      if (token) {
        config.headers.Authorization = "Bearer " + token;
      }
    } catch (e) {}
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;