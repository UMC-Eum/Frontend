import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  getMyProfile,
  updateMyProfile,
  deactivateUser,
  updateInterestKeywords,
} from "../../../api/users/usersApi";
import { IUserProfile } from "../../../types/user";
// 내 프로필 조회
export const useGetMyProfile = () => {
  return useQuery<IUserProfile>({
    queryKey: ["myProfile"],
    queryFn: getMyProfile,
    enabled: !!localStorage.getItem("accessToken"),
  });
};
// 프로필 수정
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateMyProfile,
    onSuccess: () => {
      console.log("프로필 수정 완료!");
      alert("프로필이 수정되었습니다.");
      queryClient.invalidateQueries({ queryKey: ["myProfile"] });
    },
    onError: (error) => {
      console.error("수정 실패:", error);
      alert("프로필 수정에 실패했습니다.");
    },
  });
};

// 회원 탈퇴
export const useDeactivateUser = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: deactivateUser,
    onSuccess: () => {
      console.log("회원 탈퇴 완료!");
      alert("회원 탈퇴가 완료되었습니다.");

      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");

      queryClient.removeQueries({ queryKey: ["myProfile"] });

      navigate("/", { replace: true });
    },
    onError: (error) => {
      console.error("회원 탈퇴 실패:", error);
      alert("회원 탈퇴에 실패했습니다.");
    },
  });
};
// 관심사 수정
export const useUpdateInterestKeywords = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateInterestKeywords,
    onSuccess: () => {
      console.log("관심사 수정 완료!");
      queryClient.invalidateQueries({ queryKey: ["myProfile"] });
    },
    onError: (error) => {
      console.error("관심사 수정 실패:", error);
      alert("관심사 저장 중 오류가 발생했습니다.");
    },
  });
};
