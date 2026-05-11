import axios, { AxiosRequestConfig, AxiosError } from "axios";
import { ApiSuccessResponse, ApiFailResponse } from "../types/api/api";
import { ITokenRefreshResponse } from "../types/api/auth/authDTO";

let accessToken: string | null = null;

export const setAccessToken = (token: string | null) => {
  accessToken = token;
};

export const getAccessToken = () => accessToken;

export const clearAccessToken = () => {
  accessToken = null;
};

const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
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
          {},
          { withCredentials: true },
        );
        const { accessToken: refreshedAccessToken } = res.data.success.data;

        setAccessToken(refreshedAccessToken);
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${refreshedAccessToken}`;
        }

        return api(originalRequest);
      } catch (refreshError) {
        clearAccessToken();
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  },
);

export default api;
