import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAgreements,
  updateMarketingAgreements,
} from "../../../api/agreements/agreementsApi";
import { IAgreements } from "../../../types/api/agreements/agreementsDTO";
// 약관 조회 훅
export const useGetAgreements = () => {
  return useQuery<IAgreements[]>({
    queryKey: ["agreements"],
    queryFn: getAgreements,
    staleTime: Infinity,
    gcTime: 1000 * 60 * 60,
  });
};
// 마케팅 약관 동의 상태 업데이트 훅
export const useUpdateMarketingAgreements = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateMarketingAgreements,
    onSuccess: () => {
      console.log("마케팅 동의 설정 완료!");
      alert("설정이 저장되었습니다.");
      queryClient.invalidateQueries({ queryKey: ["myProfile"] });
    },
    onError: (error) => {
      console.error("설정 저장 실패:", error);
      alert("설정 저장 중 오류가 발생했습니다.");
    },
  });
};
