import axios from "axios";

const axiosClient = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api/v1`,
  timeout: 300000,
  withCredentials: true,
});

// ================= Request Interceptor =================
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }

    console.log(
      `Sending ${config.method?.toUpperCase()} request to ${config.url}`
    );
    return config;
  },
  (error) => Promise.reject(error)
);

// ================= Response Interceptor =================
let isRedirecting = false;

axiosClient.interceptors.response.use(
  (response) => response,

  (error) => {
    const status = error?.response?.status;

    if (status === 401 && !isRedirecting) {
      isRedirecting = true;

      try {
        localStorage.removeItem("authToken");

        // clear cookies
        document.cookie.split(";").forEach((cookie) => {
          const name = cookie.split("=")[0].trim();
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
        });

        if (window.location.pathname !== "/") {
          window.location.replace("/");
        } else {
          console.warn("Already on login page, skipping redirect");
        }
      } catch (e) {
        console.error("Logout cleanup failed", e);
      }
    }

    if (error.response) {
      console.error(
        "API Error:",
        error.response.data?.message || "Unknown error"
      );
    } else if (error.request) {
      console.error("Network Error: No response from server.");
    } else {
      console.error("Axios Error:", error.message);
    }

    return Promise.reject(error);
  }
);

export default axiosClient;
