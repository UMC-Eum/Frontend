import axios, { AxiosRequestConfig, AxiosError } from "axios";
import { ApiSuccessResponse, ApiFailResponse } from "../types/api/api";
import { ITokenRefreshResponse } from "../types/api/auth/authDTO";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const accessToken = localStorage.getItem("accessToken");
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & {
      _retry?: boolean;
    };
    if (originalRequest?.url?.includes("/auth/token/refresh")) {
      return Promise.reject(error);
    }

    const errorResponse = error.response?.data as ApiFailResponse | undefined;
    const errorCode = errorResponse?.error?.code;

    if (
      error.response?.status === 401 &&
      errorCode === "AUTH-002" &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;
      try {
        const res = await axios.post<ApiSuccessResponse<ITokenRefreshResponse>>(
          `${api.defaults.baseURL}/auth/token/refresh`,
          {}, // body 비움
          { withCredentials: true }, // ★ 핵심: 쿠키 전송 허용
        );
        const { accessToken } = res.data.success.data;

        localStorage.setItem("accessToken", accessToken);
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }

        return api(originalRequest);
      } catch (refreshError) {
        localStorage.clear();
        window.location.href = "/";
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  },
);

export default api;
