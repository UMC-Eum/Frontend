import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import {
  IInterest,
  IKeywordscandidate,
  IPersonality,
} from "../types/api/onboarding/onboardingDTO";

interface ScoreState {
  keywords: {
    personalities: IPersonality[];
    interests: IInterest[];
    ideal: IPersonality[];
  };
}

interface ScoreActions {
  setScores: (candidates: IKeywordscandidate[]) => void;
  setPersonalities: (personalities: IPersonality[]) => void;
  setInterests: (interests: IInterest[]) => void;
  setIdeal: (ideal: IPersonality[]) => void;
  clearScores: () => void;
}

const sortByScore = <T extends { score: number }>(arr: T[]): T[] => {
  return [...arr].sort((a, b) => b.score - a.score);
};

export const useScoreStore = create<ScoreState & ScoreActions>()(
  devtools(
    persist(
      immer((set) => ({
        keywords: {
          personalities: [],
          interests: [],
          ideal: [],
        },

        setScores: (candidates) =>
          set((state) => {
            const personalityMap = new Map<string, IPersonality>();
            const interestMap = new Map<string, IInterest>();

            candidates.forEach((candidate) => {
              if (candidate.personalities) {
                candidate.personalities.forEach((p) => {
                  if (
                    !personalityMap.has(p.text) ||
                    personalityMap.get(p.text)!.score < p.score
                  ) {
                    personalityMap.set(p.text, p);
                  }
                });
              }
              if (candidate.interests) {
                candidate.interests.forEach((i) => {
                  if (
                    !interestMap.has(i.text) ||
                    interestMap.get(i.text)!.score < i.score
                  ) {
                    interestMap.set(i.text, i);
                  }
                });
              }
            });

            state.keywords.personalities = sortByScore(
              Array.from(personalityMap.values()),
            );
            state.keywords.interests = sortByScore(
              Array.from(interestMap.values()),
            );
          }),

        setPersonalities: (personalities) =>
          set((state) => {
            state.keywords.personalities = sortByScore(personalities);
          }),

        setInterests: (interests) =>
          set((state) => {
            state.keywords.interests = sortByScore(interests);
          }),

        setIdeal: (ideal) =>
          set((state) => {
            state.keywords.ideal = sortByScore(ideal);
          }),

        clearScores: () =>
          set((state) => {
            state.keywords.personalities = [];
            state.keywords.interests = [];
            state.keywords.ideal = [];
          }),
      })),
      {
        name: "score-storage",
      },
    ),
    {
      name: "ScoreStore",
    },
  ),
);
