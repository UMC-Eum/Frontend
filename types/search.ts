export type SortOption = "recommended" | "latest";

export type Club = {
  id: string;
  title: string;
  district: string;
  host: string;
  description: string;
  members: number;
  date: string;
  score: number;
  createdAt: number;
};
