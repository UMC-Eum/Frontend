import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import {
  getAgreements,
  updateMarketingAgreements,
} from "../../../api/agreements/agreementsApi";

import { IAgreements } from "../../../types/api/agreements/agreementsDTO";

export const useAgreements = () => {
  const queryClient = useQueryClient();

  /* ===============================
   * 1. 약관 조회
   * =============================== */
  const useGetAgreements = () =>
    useQuery<IAgreements[]>({
      queryKey: ["agreements"],
      queryFn: getAgreements,
      staleTime: Infinity,
      gcTime: 1000 * 60 * 60,
    });

  /* ===============================
   * 2. 마케팅 약관 동의 업데이트
   * =============================== */
  const useUpdateMarketingAgreements = () =>
    useMutation({
      mutationFn: updateMarketingAgreements,
      onSuccess: () => {
        console.log("마케팅 동의 설정 완료!");
        alert("설정이 저장되었습니다.");

        // 프로필과 연관된 정보이므로 갱신
        queryClient.invalidateQueries({ queryKey: ["myProfile"] });
      },
      onError: (error) => {
        console.error("설정 저장 실패:", error);
        alert("설정 저장 중 오류가 발생했습니다.");
      },
    });

  return {
    useGetAgreements,
    useUpdateMarketingAgreements,
  };
};
