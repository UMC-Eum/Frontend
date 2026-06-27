import { create } from "zustand";

type DraftGender = "M" | "F";

interface OnboardingDraftState {
  nickname: string;
  age: number | null;
  gender: DraftGender | null;
  birthDate: string | null;
  profileImageUri: string | null;
  introText: string;
  introAudioUrl: string;
  selectedKeywords: string[];
  personalities: string[];
  idealPersonalities: string[];
  vibeVector: number[];
  setNickname: (nickname: string) => void;
  setAge: (age: number) => void;
  setGender: (gender: DraftGender) => void;
  setBirthDate: (birthDate: string | null) => void;
  setProfileImageUri: (profileImageUri: string | null) => void;
  setIntroText: (introText: string) => void;
  setIntroAudioUrl: (introAudioUrl: string) => void;
  setSelectedKeywords: (selectedKeywords: string[]) => void;
  setPersonalities: (personalities: string[]) => void;
  setIdealPersonalities: (idealPersonalities: string[]) => void;
  setVibeVector: (vibeVector: number[]) => void;
  resetDraft: () => void;
}

const initialState = {
  nickname: "",
  age: null,
  gender: null,
  birthDate: null,
  profileImageUri: null,
  introText: "",
  introAudioUrl: "",
  selectedKeywords: [],
  personalities: [],
  idealPersonalities: [],
  vibeVector: [],
};

export const useOnboardingDraftStore = create<OnboardingDraftState>((set) => ({
  ...initialState,
  setNickname: (nickname) => set({ nickname }),
  setAge: (age) => set({ age }),
  setGender: (gender) => set({ gender }),
  setBirthDate: (birthDate) => set({ birthDate }),
  setProfileImageUri: (profileImageUri) => set({ profileImageUri }),
  setIntroText: (introText) => set({ introText }),
  setIntroAudioUrl: (introAudioUrl) => set({ introAudioUrl }),
  setSelectedKeywords: (selectedKeywords) => set({ selectedKeywords }),
  setPersonalities: (personalities) => set({ personalities }),
  setIdealPersonalities: (idealPersonalities) => set({ idealPersonalities }),
  setVibeVector: (vibeVector) => set({ vibeVector }),
  resetDraft: () => set(initialState),
}));
