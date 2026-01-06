import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import * as api from "../../../api/socials/socialsApi";
import * as DTO from "../../../types/api/socials/socialsDTO";

export const useSocial = () => {
  const queryClient = useQueryClient();

  // --- 1. Hearts Hooks ---

  /** 마음 보내기 */
  const useSendHeart = () =>
    useMutation({
      mutationFn: (body: DTO.IHeartsRequest) => api.sendHeart(body),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["social", "hearts"] });
      },
    });

  /** 보낸 마음 목록 조회 */
  const useSentHearts = (params: { cursor?: string | null; size: number }) =>
    useQuery({
      queryKey: ["social", "hearts", "sent", params],
      queryFn: () => api.getSentHearts(params),
    });

  /** 받은 마음 목록 조회 */
  const useReceivedHearts = (params: {
    cursor?: string | null;
    size: number;
  }) =>
    useQuery({
      queryKey: ["social", "hearts", "received", params],
      queryFn: () => api.getReceivedHearts(params),
    });

  /** 마음 상태 수정 (PATCH) */
  const usePatchHeart = () =>
    useMutation({
      mutationFn: (heartId: number) => api.patchHeart(heartId),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["social", "hearts"] });
      },
    });

  // --- 2. Blocks Hooks ---

  /** 유저 차단하기 */
  const useBlockUser = () =>
    useMutation({
      mutationFn: (body: DTO.IBlocksRequest) => api.blockUser(body),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["social", "blocks"] });
      },
    });

  /** 차단 목록 조회 */
  const useBlockList = (params: { cursor?: string | null; size: number }) =>
    useQuery({
      queryKey: ["social", "blocks", "list", params],
      queryFn: () => api.getBlocks(params),
    });

  /** 차단 해제/수정 (PATCH) */
  const usePatchBlock = () =>
    useMutation({
      mutationFn: (blockId: number) => api.patchBlock(blockId),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["social", "blocks"] });
      },
    });

  // --- 3. Reports Hooks ---

  /** 유저 신고하기 */
  const useReportUser = () =>
    useMutation({
      mutationFn: (body: DTO.IReportsRequest) => api.createReport(body),
    });

  return {
    useSendHeart,
    useSentHearts,
    useReceivedHearts,
    usePatchHeart,
    useBlockUser,
    useBlockList,
    usePatchBlock,
    useReportUser,
  };
};
