import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  attendMeeting,
  cancelMeetingAttendance,
  createMeeting,
  deleteMeeting,
  getMeetingAttendees,
  getMeetingDetail,
  getMeetings,
  updateMeeting,
} from "@/api/meetings/meetingsApi";
import * as DTO from "@/types/api/meetings/meetingsDTO";

import { queryKeys } from "./queryKeys";

const DEFAULT_PAGE_LIMIT = 20;

type InfiniteParams<T extends { cursor?: string | null; limit?: number }> = Omit<
  T,
  "cursor" | "limit"
> & {
  limit?: number;
};

type AttendeesInfiniteParams = Omit<
  DTO.IMeetingAttendeesGetParams,
  "cursor" | "size"
> & {
  size?: number;
};

export function useMeetingsInfiniteQuery(
  clubId: number,
  params: InfiniteParams<DTO.IMeetingsGetParams> = {},
  enabled = true,
) {
  const { limit = DEFAULT_PAGE_LIMIT, ...restParams } = params;

  return useInfiniteQuery({
    queryKey: queryKeys.meetings.list(clubId, { ...restParams, limit }),
    queryFn: ({ pageParam }) =>
      getMeetings(clubId, { ...restParams, cursor: pageParam, limit }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    enabled: enabled && Number.isFinite(clubId),
  });
}

export function useMeetingDetailQuery(
  clubId: number,
  meetingId: number,
  enabled = true,
) {
  return useQuery({
    queryKey: queryKeys.meetings.detail(clubId, meetingId),
    queryFn: () => getMeetingDetail(clubId, meetingId),
    enabled: enabled && Number.isFinite(clubId) && Number.isFinite(meetingId),
  });
}

export function useMeetingAttendeesInfiniteQuery(
  clubId: number,
  meetingId: number,
  params: AttendeesInfiniteParams = {},
  enabled = true,
) {
  const { size = DEFAULT_PAGE_LIMIT, ...restParams } = params;

  return useInfiniteQuery({
    queryKey: queryKeys.meetings.attendees(clubId, meetingId, {
      ...restParams,
      size,
    }),
    queryFn: ({ pageParam }) =>
      getMeetingAttendees(clubId, meetingId, {
        ...restParams,
        cursor: pageParam,
        size,
      }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    enabled: enabled && Number.isFinite(clubId) && Number.isFinite(meetingId),
  });
}

export function useCreateMeetingMutation(clubId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: DTO.IMeetingCreateRequest) => createMeeting(clubId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.club.detail(clubId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.meetings.all(clubId) });
    },
  });
}

export function useUpdateMeetingMutation(clubId: number, meetingId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: DTO.IMeetingUpdateRequest) =>
      updateMeeting(clubId, meetingId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.meetings.all(clubId) });
    },
  });
}

export function useDeleteMeetingMutation(clubId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (meetingId: number) => deleteMeeting(clubId, meetingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.meetings.all(clubId) });
    },
  });
}

export function useAttendMeetingMutation(clubId: number, meetingId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => attendMeeting(clubId, meetingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.club.detail(clubId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.meetings.all(clubId) });
      queryClient.invalidateQueries({
        queryKey: queryKeys.meetings.detail(clubId, meetingId),
      });
    },
  });
}

export function useCancelMeetingAttendanceMutation(
  clubId: number,
  meetingId: number,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => cancelMeetingAttendance(clubId, meetingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.meetings.all(clubId) });
    },
  });
}
