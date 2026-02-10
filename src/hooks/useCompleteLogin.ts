import { useCallback, useState } from "react";
import { getMyProfile } from "../api/users/usersApi";
import { useUserStore } from "../stores/useUserStore";
import { IUserProfileExtend } from "../types/user";

const calculateAge = (birthDate?: string) => {
  if (!birthDate) return 0;
  const today = new Date();
  const bd = new Date(birthDate);
  let age = today.getFullYear() - bd.getFullYear();
  const monthDiff = today.getMonth() - bd.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < bd.getDate())) {
    age--;
  }

  return age;
};

export default function useCompleteLogin() {
  const updateUser = useUserStore((s) => s.updateUser);
  const setIsLoggedIn = useUserStore((s) => s.setIsLoggedIn);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const completeLogin = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      //여기서 문제 터짐. DB랑 얘기해봐야함
      const user = await getMyProfile(); // IUserProfile
      console.log("가져온 유저 정보", user);

      const userWithAge: IUserProfileExtend = {
        ...user,
        age: calculateAge(user.birthDate),
      };

      // store에 저장
      updateUser(userWithAge);
      console.log("✅ 사용자 프로필 로드 및 상태 업데이트 완료:", userWithAge);
      setIsLoggedIn(true);

      return userWithAge;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [updateUser, setIsLoggedIn]);

  return { completeLogin, loading, error } as const;
}
