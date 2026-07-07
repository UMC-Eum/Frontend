export interface IUserArea {
  code: string;
  name: string;
}
export interface IUserProfile {
  userId: number;
  nickname: string;
  gender: string;
  birthDate: string;
  area: IUserArea;
  introText: string;
  keywords: string[];
  personalities: string[];
  idealPersonalities: string[];
  introAudioUrl: string;
  profileImageUrl: string;
  age: number;
  isLiked?: boolean;
  likedHeartId?: number | null;
}

// 타인 공개 프로필 (GET /v1/users/{userId}/profile) — /users/me와 응답 스키마가 다름
export interface IProfileClubSummary {
  clubId: number;
  name: string;
  thumbnailUrl: string | null;
  category: string;
  introText: string | null;
}

export interface IUserPublicProfile {
  userId: number;
  nickname: string;
  age: number;
  gender: string;
  area: { name: string };
  introText: string;
  interests: string[];
  idealPersonalities: string[];
  participatingClubs: IProfileClubSummary[];
  hostingClubs: IProfileClubSummary[];
  hasSentHeart: boolean;
  sentHeartId: number | null;
  profileImageUrl: string;
}
