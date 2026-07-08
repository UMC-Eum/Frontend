import type {
  ClubAuthority,
  ClubJoinPolicy,
  IClubUserSummary,
} from "../club/clubDTO";

export type MeetingFilter = "upcoming" | "past" | "all";
export type MeetingSort = "date_asc" | "date_desc";
export type MeetingRecurrenceType = "DAILY" | "WEEKLY" | "MONTHLY";
export type MeetingWeekday =
  | "MON"
  | "TUE"
  | "WED"
  | "THU"
  | "FRI"
  | "SAT"
  | "SUN";

export interface IMeetingCreateRequest {
  name: string;
  introText: string;
  spot: string;
  capacity: number;
  cost?: string;
  joinPolicy: ClubJoinPolicy;
  recurrence: IMeetingRecurrence;
}

export interface IMeetingResponse {
  meetingId: number;
  clubId: number;
  name: string;
  introText?: string;
  date: string;
  spot: string;
  capacity?: number;
  cost?: string | null;
  joinPolicy?: ClubJoinPolicy;
  isRegular: boolean;
  recurrence?: IMeetingRecurrence;
  dateLabel?: string;
  nextOccurrenceAt?: string;
  attendeeCount: number;
  createdAt: string;
}

export type IMeetingCreateResponse = IMeetingResponse;

export interface IMeetingsGetParams {
  filter?: MeetingFilter;
  isRegular?: boolean;
  sort?: MeetingSort;
  cursor?: string | null;
  limit?: number;
}

export interface IMeetingListItem {
  meetingId: number;
  name: string;
  date: string;
  spot: string;
  capacity?: number;
  cost?: string | null;
  isRegular: boolean;
  attendeeCount: number;
  isAttending: boolean;
  isPast: boolean;
  createdAt: string;
}

export interface IMeetingsGetResponse {
  clubId: number;
  meetings: IMeetingListItem[];
  nextCursor: string | null;
  hasMore: boolean;
}

export interface IMeetingRecurrence {
  type: MeetingRecurrenceType;
  daysOfWeek?: MeetingWeekday[] | null;
  dayOfMonth?: number | null;
  hour: number;
  minute: number;
}

export interface IMeetingDetailResponse {
  meetingId: number;
  clubId: number;
  name: string;
  introText: string;
  spot: string;
  cost: string | null;
  capacity: number;
  attendeeCount: number;
  joinPolicy: ClubJoinPolicy;
  isRegular: boolean;
  isAttending: boolean;
  recurrence: IMeetingRecurrence;
  dateLabel: string;
  nextOccurrenceAt: string;
  attendeesPreview: IClubUserSummary[];
  createdAt: string;
  updatedAt: string | null;
}

export interface IMeetingUpdateRequest {
  name?: string;
  introText?: string;
  date?: string;
  spot?: string;
  capacity?: number;
  cost?: string | null;
  joinPolicy?: ClubJoinPolicy;
  isRegular?: boolean;
  recurrence?: IMeetingRecurrence;
}

export interface IMeetingUpdateResponse {
  meetingId: number;
  name: string;
  date: string;
  spot: string;
  isRegular: boolean;
  updatedAt: string;
}

export interface IMeetingDeleteResponse {
  meetingId: number;
  clubId: number;
  deletedAt: string;
}

export interface IMeetingAttendeesGetParams {
  cursor?: string | null;
  size?: number;
}

export interface IMeetingAttendeeUser extends IClubUserSummary {
  authority: ClubAuthority;
}

export interface IMeetingAttendee {
  meetingMemberId: number;
  clubUserId: number;
  user: IMeetingAttendeeUser;
  joinedAt: string;
}

export interface IMeetingAttendeesGetResponse {
  meetingId: number;
  attendeeCount: number;
  attendees: IMeetingAttendee[];
  nextCursor: string | null;
  hasMore: boolean;
}

export interface IMeetingAttendResponse {
  meetingMemberId: number;
  meetingId: number;
  clubUserId: number;
  userId: number;
  joinedAt: string;
}

export interface IMeetingCancelAttendanceResponse {
  meetingId: number;
  userId: number;
  canceledAt: string;
}
