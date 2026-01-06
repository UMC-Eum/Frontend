export interface IUserProfile {
  userId: number;
  nickname: string;
  gender: "F" | "M";
  birthdate: string;
  area: { code: string; name: string };
  introText: string;
  keywords: string[];
  introAudioUrl: string;
  profileImageUrl: string;
}
