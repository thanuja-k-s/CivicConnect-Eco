import axios, { InternalAxiosRequestConfig } from "axios";

// Extend Axios config to support a 'silent401' flag.
// When true, a 401 response will NOT trigger the global logout/redirect.
// Use this for background data-fetch calls that already handle errors gracefully.
declare module "axios" {
  interface InternalAxiosRequestConfig {
    silent401?: boolean;
  }
  interface AxiosRequestConfig {
    silent401?: boolean;
  }
}

const api = axios.create({
  baseURL: "http://localhost:8081/api",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log(`[API Interceptor] ✓ Token added for ${config.method?.toUpperCase()} ${config.url}`);
  } else {
    console.warn(`[API Interceptor] ✗ NO TOKEN FOUND! Request: ${config.method?.toUpperCase()} ${config.url}`);
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error - Status:", error.response?.status);
    console.error("API Error - Data:", error.response?.data);
    console.error("API Error - Message:", error.message);

    if (error.response?.status === 401 && !error.config?.silent401) {
      console.log("Received 401, dispatching auth:unauthorized event");
      // Dispatch a custom event so the React app can handle logout/redirect
      // without a hard browser reload that wipes all React state.
      window.dispatchEvent(new CustomEvent("auth:unauthorized"));
    }
    return Promise.reject(error);
  }
);

export default api;
