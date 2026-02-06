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
      const user = await getMyProfile(); // IUserProfile

      const userWithAge: IUserProfileExtend = {
        ...user,
        age: calculateAge(user.birthDate),
      };

      // store에 저장
      updateUser(userWithAge);
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
