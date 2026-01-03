export interface BaseResponse<T> {
  success: boolean;
  code: string;
  message: string;
  data: T;
  error: ApiError | null;
  timestamp: string;
  path: string;
}
export interface ApiError {
  type: "Business" | "System" | "Validation";
  details: {
    reasonCode: string;
    message: string;
  }[];
}
