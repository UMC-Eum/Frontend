import { create } from "zustand";
import { persist, devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { IUserProfile, IUserArea } from "../types/user";

interface UserState {
  user: IUserProfile | null;
  isLoggedIn: boolean;
}

interface UserActions {
  setUser: (user: IUserProfile) => void;
  updateUser: (fields: Partial<IUserProfile>) => void;
  updateArea: (area: IUserArea) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserState & UserActions>()(
  devtools(
    persist(
      immer((set) => ({
        user: null,
        isLoggedIn: false,
        setUser: (user) =>
          set((state) => {
            state.user = user;
            state.isLoggedIn = true;
          }),
        updateUser: (fields) =>
          set((state) => {
            if (state.user) {
              Object.assign(state.user, fields);
            }
          }),
        updateArea: (area) =>
          set((state) => {
            if (state.user) {
              state.user.area = area;
            }
          }),
        clearUser: () =>
          set((state) => {
            state.user = null;
            state.isLoggedIn = false;
          }),
      })),
      {
        name: "user-storage",
      }
    ),
    {
      name: "UserStore",
    }
  )
);
