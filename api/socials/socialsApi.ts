import { isAxiosError } from "axios";

import api from "../axiosInstance";
import { ApiSuccessResponse } from "../../types/api/api";
import * as DTO from "../../types/api/socials/socialsDTO";
// 마음 보내기 (POST)
export const sendHeart = async (
  body: DTO.IHeartsRequest,
): Promise<DTO.IHeartsResponse> => {
  const { data } = await api.post<ApiSuccessResponse<DTO.IHeartsResponse>>(
    "/v1/hearts",
    body,
  );
  return data.success.data;
};

// 보낸 마음 목록 조회 (GET)
export const getSentHearts = async (params: {
  cursor?: string | null;
  size: number;
}) => {
  try {
    const { data } = await api.get<ApiSuccessResponse<DTO.IHeartsentResponse>>(
      "/v1/hearts/sent",
      {
        params,
      },
    );
    return data.success.data;
  } catch (error) {
    if (isEmptyHeartListError(error)) {
      return emptyHeartList<DTO.IHeartsentResponse>();
    }

    throw error;
  }
};

// 받은 마음 목록 조회 (GET)
export const getReceivedHearts = async (params: {
  cursor?: string | null;
  size: number;
}) => {
  try {
    const { data } = await api.get<
      ApiSuccessResponse<DTO.IHeartreceivedResponse>
    >("/v1/hearts/received", {
      params,
    });
    return data.success.data;
  } catch (error) {
    if (isEmptyHeartListError(error)) {
      return emptyHeartList<DTO.IHeartreceivedResponse>();
    }

    throw error;
  }
};

function isEmptyHeartListError(error: unknown) {
  return (
    isAxiosError(error) &&
    error.response?.status === 404 &&
    error.response.data?.error?.code === "SOCIAL-004"
  );
}

function emptyHeartList<
  T extends { nextCursor: string | null; totalCount?: number; items: unknown[] },
>() {
  return {
    nextCursor: null,
    totalCount: 0,
    items: [],
  } as unknown as T;
}

export const patchHeart = async (heartId: number) => {
  const { data } = await api.patch<ApiSuccessResponse<null>>(
    `/v1/hearts/${heartId}`,
  );
  return data.success.data;
};

// --- 2. Blocks API ---

// 차단하기 (POST)
export const blockUser = async (body: DTO.IBlocksRequest) => {
  const { data } = await api.post<ApiSuccessResponse<DTO.IBlocksResponse>>(
    "/v1/block",
    body,
  );
  return data.success.data;
};

// 차단 목록 조회 (GET)
export const getBlocks = async (params: {
  cursor?: string | null;
  size: number;
}) => {
  const { data } = await api.get<ApiSuccessResponse<DTO.IBlocksGetResponse>>(
    "/v1/block",
    {
      params,
    },
  );
  return data.success.data;
};

export const patchBlock = async (blockId: number) => {
  const { data } = await api.patch<ApiSuccessResponse<null>>(
    `/v1/block/${blockId}`,
  );
  return data.success.data;
};

// 신고하기 (POST)
export const createReport = async (body: DTO.IReportsRequest) => {
  const { data } = await api.post<ApiSuccessResponse<DTO.IReportsResponse>>(
    "/v1/report",
    body,
  );
  return data.success.data;
};

export const createClubReport = async (body: DTO.IClubReportRequest) => {
  const { data } = await api.post<
    ApiSuccessResponse<DTO.IClubReportResponse>
  >("/v1/socials/report/club", body);
  return data.success.data;
};
