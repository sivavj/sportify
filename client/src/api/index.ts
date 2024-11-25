import axios from "axios";

export const api = axios.create({
  baseURL: "http://localhost:3000/api",
});

export const getAccessToken = (): string | null => {
  try {
    const authData = localStorage.getItem("auth-storage");

    if (authData) {
      const parsedAuthData = JSON.parse(authData);
      return parsedAuthData?.state?.accessToken || null;
    }

    return null;
  } catch (error) {
    console.error("Failed to retrieve access token:", error);
    return null;
  }
};

// Add a request interceptor
api.interceptors.request.use(
  (config) => {
    const accessToken = getAccessToken();

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
