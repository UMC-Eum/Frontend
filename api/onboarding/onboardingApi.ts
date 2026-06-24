import api from "../axiosInstance";
import { ApiSuccessResponse } from "../../types/api/api";
import {
  IPresignRequest,
  IPresignResponse,
  IProfileRequest,
  IProfileResponse,
  IRecommendationsRequest,
  IRecommendationsResponse,
} from "../../types/api/onboarding/onboardingDTO";

// v1/files/presign (POST)
export const postPresign = async (body: IPresignRequest) => {
  const { data } = await api.post<ApiSuccessResponse<IPresignResponse>>(
    "/v1/files/presign",
    body,
  );

  return data.success.data;
};

// S3 Direct Upload (PUT)
export const uploadFileToS3 = async (
  uploadUrl: string,
  file: Blob | File,
  requiredHeaders?: Record<string, string>,
) => {
  const contentType = requiredHeaders?.["Content-Type"] || file.type;

  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.open("PUT", uploadUrl);
    xhr.setRequestHeader("Content-Type", contentType);

    Object.entries(requiredHeaders ?? {}).forEach(([key, value]) => {
      if (key.toLowerCase() !== "content-type") {
        xhr.setRequestHeader(key, value);
      }
    });

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
        return;
      }

      reject(new Error(`S3 업로드 실패: ${xhr.status} ${xhr.responseText}`));
    };
    xhr.onerror = () => {
      reject(new Error("S3 업로드 네트워크 요청에 실패했습니다."));
    };
    xhr.ontimeout = () => {
      reject(new Error("S3 업로드 요청 시간이 초과되었습니다."));
    };

    xhr.send(file);
  });
};

// v1/onboarding/profile (POST)
export const postProfile = async (body: IProfileRequest) => {
  const { data } = await api.post<ApiSuccessResponse<IProfileResponse>>(
    "/v1/onboarding/profile",
    body,
  );

  return data.success.data;
};
//v1/matches/recommendation(get)
export const getRecommendations = async (body: IRecommendationsRequest) => {
  const { data } = await api.get<ApiSuccessResponse<IRecommendationsResponse>>(
    "/v1/matches/recommended",
    { params: body },
  );

  return data.success.data;
};

//v1/onboarding/ideal-personalities (PUT)
export const putIdealPersonalities = async (body: {
  personalityIds: string[];
}) => {
  const { data } = await api.put<ApiSuccessResponse<null>>(
    "/v1/onboarding/ideal-personalities",
    body,
  );

  return data.success.data;
};
