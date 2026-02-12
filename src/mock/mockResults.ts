export type MatchResult = {
  id: number;
  name: string;
  age: number;
};

export const MOCK_RESULTS: MatchResult[] = Array.from(
  { length: 100 },
  (_, i) => ({
    id: i + 1,
    name: `상대 ${i + 1}`,
    age: 60 + (i % 10),
  }),
);
