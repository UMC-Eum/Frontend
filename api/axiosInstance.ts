import axios, { AxiosRequestConfig, AxiosError } from "axios";
import { ApiSuccessResponse, ApiFailResponse } from "../types/api/api";
import { ITokenRefreshResponse } from "../types/api/auth/authDTO";
import { getAuthAccessToken, useAuthStore } from "../stores/authStore";

export const setAccessToken = (token: string | null) => {
  useAuthStore.getState().setAccessToken(token);
};

export const getAccessToken = () => getAuthAccessToken();

export const clearAccessToken = () => {
  useAuthStore.getState().clearAuth();
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
  if (__DEV__) {
    const method = config.method?.toUpperCase() ?? "GET";
    console.log(`[API Request] ${method} ${config.baseURL}${config.url}`);
  }
  return config;
});

api.interceptors.response.use(
  (response) => {
    if (__DEV__) {
      const method = response.config.method?.toUpperCase() ?? "GET";
      console.log(
        `[API Response] ${response.status} ${method} ${response.config.url}`,
      );
    }
    return response;
  },
  async (error: AxiosError) => {
    if (__DEV__) {
      const method = error.config?.method?.toUpperCase() ?? "GET";
      console.log(
        `[API Error] ${error.response?.status ?? "NETWORK"} ${method} ${error.config?.url}`,
        error.response?.data ?? error.message,
      );
    }
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
