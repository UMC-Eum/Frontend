import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { IInterest, IKeywordscandidate, IPersonality } from "../types/api/onboarding/onboardingDTO";

interface ScoreState {
  keywords: {
    personalities: IPersonality[];
    interests: IInterest[];
  };
}

//상태 참조보다 get 사용하는게 쓰기 편해요
interface ScoreActions {
  //set
  setScores: (candidates: IKeywordscandidate[]) => void;
  setPersonalities: (personalities: IPersonality[]) => void;
  setInterests: (interests: IInterest[]) => void;
  //get
  getScores: () => string[];
  getPersonalities: () => string[];
  getInterests: () => string[];
  clearScores: () => void;
}

const sortByScore = <T extends { score: number }>(arr: T[]): T[] => {
  return [...arr].sort((a, b) => b.score - a.score);
};

export const useScoreStore = create<ScoreState & ScoreActions>()(
  devtools(
    persist(
      immer((set, get) => ({ 
        keywords: {
          personalities: [],
          interests: [],
        },

        setScores: (candidates) =>
          set((state) => {
            const allPersonalities: IPersonality[] = [];
            const allInterests: IInterest[] = [];

            candidates.forEach((candidate) => {
              if (candidate.personalities) allPersonalities.push(...candidate.personalities);
              if (candidate.interests) allInterests.push(...candidate.interests);
            });

            state.keywords.personalities = sortByScore(allPersonalities);
            state.keywords.interests = sortByScore(allInterests);
          }),

        setPersonalities: (personalities) =>
          set((state) => {
            state.keywords.personalities = sortByScore(personalities);
          }),

        setInterests: (interests) =>
          set((state) => {
            state.keywords.interests = sortByScore(interests);
          }),

        getPersonalities: () => {
          return get().keywords.personalities.map((p) => p.text);
        },

        getInterests: () => {
          return get().keywords.interests.map((i) => i.text);
        },

        getScores: () => {
          const { personalities, interests } = get().keywords;
          return [...personalities, ...interests]
            .sort((a, b) => b.score - a.score)
            .map((item) => item.text);
        },

        clearScores: () =>
          set((state) => {
            state.keywords.personalities = [];
            state.keywords.interests = [];
          }),
      })),
      {
        name: "score-storage",
      }
    ),
    {
      name: "ScoreStore",
    }
  )
);