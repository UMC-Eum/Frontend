export type ClubMemberRole = "HOST" | "MANAGER" | "MEMBER";
export type ClubMemberStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface IClubArea {
  code?: string;
  name: string;
}

export interface IClubHost {
  userId: number;
  nickname: string;
  profileImageUrl?: string | null;
}

export interface IClubSummary {
  clubId: number;
  title?: string;
  name?: string;
  description?: string;
  category?: string;
  area?: IClubArea;
  location?: string;
  host?: IClubHost;
  thumbnailImageUrl?: string | null;
  imageUrl?: string | null;
  memberCount?: number;
  currentMemberCount?: number;
  maxMemberCount?: number;
  likeCount?: number;
  isLiked?: boolean;
  isJoined?: boolean;
  createdAt?: string;
  score?: number;
}

export interface IClubDetailResponse extends IClubSummary {
  intro?: string;
  introduction?: string;
  imageUrls?: string[];
  membershipStatus?: ClubMemberStatus;
  myRole?: ClubMemberRole;
  chatRoomId?: number | null;
}

export interface IClubListRequest {
  cursor?: string | null;
  size: number;
  keyword?: string;
  category?: string;
  areaCode?: string;
}

export interface IClubListResponse {
  nextCursor: string | null;
  items: IClubSummary[];
}

export interface IJoinClubRequest {
  message?: string;
}

export interface IJoinClubResponse {
  clubMemberId?: number;
  status?: ClubMemberStatus;
}

export interface IClubArchiveItem {
  archiveId: number;
  imageUrl: string;
  createdAt?: string;
  uploadedBy?: IClubHost;
}

export interface IClubArchivesGetResponse {
  nextCursor: string | null;
  items: IClubArchiveItem[];
}

export interface IClubMeeting {
  meetingId: number;
  clubId?: number;
  title: string;
  description?: string;
  startsAt?: string;
  dateText?: string;
  location?: string;
  cost?: number;
  costText?: string;
  attendeeCount?: number;
  currentAttendeeCount?: number;
  maxAttendeeCount?: number;
  isAttending?: boolean;
  attendeesPreview?: IClubHost[];
}

export interface IClubMeetingsGetResponse {
  nextCursor: string | null;
  items: IClubMeeting[];
}

export interface IClubMeetingDetailResponse extends IClubMeeting {
  host?: IClubHost;
}

export interface IClubMeetingAttendee {
  attendeeId?: number;
  userId: number;
  nickname: string;
  profileImageUrl?: string | null;
  role?: ClubMemberRole;
  joinedAt?: string;
}

export interface IClubMeetingAttendeesGetResponse {
  nextCursor: string | null;
  items: IClubMeetingAttendee[];
}
