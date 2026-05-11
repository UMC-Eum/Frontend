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
}
export interface IUserProfileExtend extends IUserProfile {
  age: number;
}
