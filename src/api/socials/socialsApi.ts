import api from "../axiosInstance";
import { ApiSuccessResponse } from "../../types/api/api";
import * as DTO from "../../types/api/socials/socialsDTO";
// 마음 보내기 (POST)
export const sendHeart = async (body: DTO.IHeartsRequest):Promise<DTO.IHeartsResponse> => {
  const { data } = await api.post<ApiSuccessResponse<DTO.IHeartsResponse>>(
    "/v1/hearts",
    body
  );
  return data.success.data;
};

// 보낸 마음 목록 조회 (GET)
export const getSentHearts = async (params: {
  cursor?: string | null;
  size: number;
}) => {
  const { data } = await api.get<ApiSuccessResponse<DTO.IHeartsentResponse>>(
    "/v1/hearts/sent",
    {
      params,
    }
  );
  return data.success.data;
};

// 받은 마음 목록 조회 (GET)
export const getReceivedHearts = async (params: {
  cursor?: string | null;
  size: number;
}) => {
  const { data } = await api.get<
    ApiSuccessResponse<DTO.IHeartreceivedResponse>
  >("/v1/hearts/received", {
    params,
  });
  return data.success.data;
};

// 마음 상태 수정 (PATCH) -> ★ 데이터가 없으므로 <null>
export const patchHeart = async (heartId: number) => {
  const { data } = await api.patch<ApiSuccessResponse<null>>(
    `/v1/hearts/${heartId}`
  );
  return data.success.data;
};

// --- 2. Blocks API ---

// 차단하기 (POST)
export const blockUser = async (body: DTO.IBlocksRequest) => {
  const { data } = await api.post<ApiSuccessResponse<DTO.IBlocksResponse>>(
    "/v1/blocks",
    body
  );
  return data.success.data;
};

// 차단 목록 조회 (GET)
export const getBlocks = async (params: {
  cursor?: string | null;
  size: number;
}) => {
  const { data } = await api.get<ApiSuccessResponse<DTO.IBlocksGetResponse>>(
    "/v1/blocks",
    {
      params,
    }
  );
  return data.success.data;
};

// 차단 해제/수정 (PATCH) -> ★ 데이터가 없으므로 <null>
export const patchBlock = async (blockId: number) => {
  const { data } = await api.patch<ApiSuccessResponse<null>>(
    `/v1/blocks/${blockId}`
  );
  return data.success.data;
};

// --- 3. Reports API ---

// 신고하기 (POST)
export const createReport = async (body: DTO.IReportsRequest) => {
  const { data } = await api.post<ApiSuccessResponse<DTO.IReportsResponse>>(
    "/v1/reports",
    body
  );
  return data.success.data;
};
