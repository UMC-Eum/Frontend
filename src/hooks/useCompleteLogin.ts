import { useCallback, useState } from "react";
import { getMyProfile } from "../api/users/usersApi";
import { useUserStore } from "../stores/useUserStore";

export default function useCompleteLogin() {
  const updateUser = useUserStore((s) => s.updateUser);
  const setIsLoggedIn = useUserStore((s) => s.setIsLoggedIn);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const completeLogin = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const user = await getMyProfile(); // IUserProfile
      console.log("가져온 유저 정보", user);

      // store에 저장
      updateUser(user);
      console.log("✅ 사용자 프로필 로드 및 상태 업데이트 완료:", user);
      setIsLoggedIn(true);

      return user;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [updateUser, setIsLoggedIn]);

  return { completeLogin, loading, error } as const;
}
