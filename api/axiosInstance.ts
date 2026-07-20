import axios, {
  AxiosError,
  AxiosRequestConfig,
  create,
  isAxiosError,
} from "axios";
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

export const getApiErrorMessage = (error: unknown) =>
  isAxiosError<ApiFailResponse>(error)
    ? error.response?.data?.error?.message
    : undefined;

const api = create({
  baseURL: normalizedBaseUrl,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
  timeout: 15000,
});

const formatDebugPayload = (payload: unknown) => {
  if (payload === undefined || payload === null || payload === "") {
    return payload;
  }

  if (typeof FormData !== "undefined" && payload instanceof FormData) {
    return "[FormData]";
  }

  if (typeof payload === "string") {
    try {
      return JSON.stringify(JSON.parse(payload), null, 2);
    } catch {
      return payload;
    }
  }

  try {
    return JSON.stringify(payload, null, 2);
  } catch {
    return payload;
  }
};

// 동시 401 다발 시 refresh가 병렬로 여러 번 나가면, refresh token 회전 정책에서
// 뒤따른 요청들이 전부 실패해 세션이 끊긴다 → 진행 중인 refresh를 공유한다.
let refreshPromise: Promise<string> | null = null;

export const refreshAccessToken = async () => {
  if (refreshPromise) {
    return refreshPromise;
  }

  if (!normalizedBaseUrl) {
    throw new Error(
      "EXPO_PUBLIC_API_BASE_URL is required to refresh access token.",
    );
  }

  refreshPromise = (async () => {
    try {
      const res = await axios.post<ApiSuccessResponse<ITokenRefreshResponse>>(
        `${normalizedBaseUrl}${REFRESH_TOKEN_PATH}`,
        {},
        { withCredentials: true, timeout: 15000 },
      );
      const { accessToken: refreshedAccessToken } = res.data.success.data;

      setAccessToken(refreshedAccessToken);

      if (__DEV__) {
        console.log("[ACCESS_TOKEN][REFRESH]", refreshedAccessToken);
      }

      return refreshedAccessToken;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
};

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (__DEV__) {
    const method = config.method?.toUpperCase() ?? "GET";
    console.log(`[API Request] ${method} ${config.baseURL}${config.url}`);
    if (config.params) {
      console.log("[API Request Params]", formatDebugPayload(config.params));
    }
    if (config.data) {
      console.log("[API Request Body]", formatDebugPayload(config.data));
    }
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
