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
  introAudioUrl: string;
  profileImageUrl: string;
}
