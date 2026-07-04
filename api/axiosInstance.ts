import axios, { AxiosError, AxiosRequestConfig } from "axios";
import { getAuthAccessToken, useAuthStore } from "../stores/authStore";
import { ApiFailResponse, ApiSuccessResponse } from "../types/api/api";
import { ITokenRefreshResponse } from "../types/api/auth/authDTO";

export const setAccessToken = (token: string | null) => {
  useAuthStore.getState().setAccessToken(token);
};

export const getAccessToken = () => getAuthAccessToken();

export const clearAccessToken = () => {
  useAuthStore.getState().clearAuth();
};

export const markAuthInitialized = () => {
  useAuthStore.getState().setAuthInitialized(true);
};

const normalizedBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL?.replace(
  /\/+$/,
  "",
);
const REFRESH_TOKEN_PATH = "/v1/auth/token/refresh";

const getJwtDebugInfo = (token: string | null) => {
  if (!token) return null;

  try {
    const payload = JSON.parse(
      atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")),
    ) as { exp?: number; sub?: string; userId?: number | string };

    return {
      exp: payload.exp,
      expired: payload.exp ? payload.exp * 1000 <= Date.now() : undefined,
      sub: payload.sub,
      userId: payload.userId,
    };
  } catch {
    return { parseFailed: true };
  }
};

const api = axios.create({
  baseURL: normalizedBaseUrl,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

export const refreshAccessToken = async () => {
  if (!normalizedBaseUrl) {
    throw new Error(
      "EXPO_PUBLIC_API_BASE_URL is required to refresh access token.",
    );
  }

  const res = await axios.post<ApiSuccessResponse<ITokenRefreshResponse>>(
    `${normalizedBaseUrl}${REFRESH_TOKEN_PATH}`,
    {},
    { withCredentials: true },
  );
  const { accessToken: refreshedAccessToken } = res.data.success.data;

  setAccessToken(refreshedAccessToken);

  if (__DEV__) {
    console.log("[ACCESS_TOKEN][REFRESH]", refreshedAccessToken);
  }

  return refreshedAccessToken;
};

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (__DEV__) {
    const method = config.method?.toUpperCase() ?? "GET";
    console.log(`[API Request] ${method} ${config.baseURL}${config.url}`, {
      hasAuthorizationHeader: Boolean(config.headers.Authorization),
      hasToken: Boolean(token),
      token: getJwtDebugInfo(token),
    });
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
    if (originalRequest?.url?.includes(REFRESH_TOKEN_PATH)) {
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
        const refreshedAccessToken = await refreshAccessToken();
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
