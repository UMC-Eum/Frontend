import { create } from "zustand";
import { persist, devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { IUserProfileExtend, IUserArea } from "../types/user";
const createInitialUser = (): IUserProfileExtend => ({
  userId: 0,
  nickname: "",
  gender: "",
  birthDate: "",
  age: 0,
  area: { code: "", name: "" },
  introText: "",
  keywords: [],
  personalities: [],
  idealPersonalities: [],
  introAudioUrl: "",
  profileImageUrl: "",
});

interface UserState {
  user: IUserProfileExtend | null;
  isLoggedIn: boolean;

  //idealKeywords는 이상형 키워드 저장공간이 따로 필요할 거 같아서 추가했씁니다.
  idealKeywords: string[];
}

interface UserActions {
  updateUser: (fields: Partial<IUserProfileExtend>) => void;
  updateArea: (area: IUserArea) => void;
  clearUser: () => void;
  setIsLoggedIn: (isLoggedIn: boolean) => void;

  //동작도 추가했습니다.
  updateIdealKeywords: (keywords: string[]) => void;
}
export const useUserStore = create<UserState & UserActions>()(
  devtools(
    persist(
      immer((set) => ({
        user: null,
        isLoggedIn: false,
        //초기값 설정
        idealKeywords: [],

        updateUser: (fields) =>
          set((state) => {
            if (state.user) {
              Object.assign(state.user, fields);
            } else {
              state.user = {
                ...createInitialUser(),
                ...fields,
              } as IUserProfileExtend;
              state.isLoggedIn = true;
            }
          }),

        //이상형 키워드 로직 구현
        updateIdealKeywords: (keywords) =>
          set((state) => {
            state.idealKeywords = keywords;
          }),

        updateArea: (area) =>
          set((state) => {
            if (state.user) {
              state.user.area = area;
            } else {
              state.user = {
                ...createInitialUser(),
                area: area,
              } as IUserProfileExtend;
              state.isLoggedIn = true;
            }
          }),

        clearUser: () =>
          set((state) => {
            state.user = null;
            state.isLoggedIn = false;
          }),

        setIsLoggedIn: (isLoggedIn) =>
          set((state) => {
            state.isLoggedIn = isLoggedIn;
          }),
      })),
      {
        name: "user-storage",
      },
    ),
    {
      name: "UserStore",
    },
  ),
);
