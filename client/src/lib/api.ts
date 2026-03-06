import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api",
});

api.interceptors.request.use(async (config) => {
  // Clerk attaches the session token
  const token = await window.Clerk?.session?.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const serverMessage = error.response?.data?.error;
    const message = serverMessage || error.message || "Something went wrong";
    console.error("[API Error]", message);
    // Override Axios generic message with the server's actual error message
    if (serverMessage) {
      error.message = serverMessage;
    }
    return Promise.reject(error);
  }
);

export default api;
