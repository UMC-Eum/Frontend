import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  attendClubMeeting,
  cancelClubMeetingAttendance,
  getClubArchives,
  getClubDetail,
  getClubMeetingAttendees,
  getClubMeetingDetail,
  getClubMeetings,
  getClubs,
  getLikedClubs,
  getMyClubs,
  getRecommendedClubs,
  getTopHostClubs,
  joinClub,
  leaveClub,
  likeClub,
  unlikeClub,
} from "@/api/clubs/clubsApi";
import { getClubPosts } from "@/api/clubs/clubPostsApi";
import { IClubListRequest, IJoinClubRequest } from "@/types/api/clubs/clubsDTO";
import { ClubPostCategory } from "@/types/api/clubs/clubPostsDTO";

import { queryKeys } from "./queryKeys";

const DEFAULT_PAGE_SIZE = 20;

export function useClubsInfiniteQuery(
  params: Omit<IClubListRequest, "cursor" | "size"> = {},
  size = DEFAULT_PAGE_SIZE,
) {
  return useInfiniteQuery({
    queryKey: queryKeys.clubs.list(size, params),
    queryFn: ({ pageParam }) =>
      getClubs({ ...params, cursor: pageParam, size }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });
}

export function useRecommendedClubsInfiniteQuery(
  params: Omit<IClubListRequest, "cursor" | "size"> = {},
  size = DEFAULT_PAGE_SIZE,
) {
  return useInfiniteQuery({
    queryKey: queryKeys.clubs.recommended(size, params),
    queryFn: ({ pageParam }) =>
      getRecommendedClubs({ ...params, cursor: pageParam, size }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });
}

export function useTopHostClubsInfiniteQuery(
  params: Omit<IClubListRequest, "cursor" | "size"> = {},
  size = DEFAULT_PAGE_SIZE,
) {
  return useInfiniteQuery({
    queryKey: queryKeys.clubs.topHosts(size, params),
    queryFn: ({ pageParam }) =>
      getTopHostClubs({ ...params, cursor: pageParam, size }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });
}

export function useMyClubsInfiniteQuery(size = DEFAULT_PAGE_SIZE) {
  return useInfiniteQuery({
    queryKey: queryKeys.clubs.myClubs(size),
    queryFn: ({ pageParam }) => getMyClubs({ cursor: pageParam, size }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });
}

export function useLikedClubsInfiniteQuery(size = DEFAULT_PAGE_SIZE) {
  return useInfiniteQuery({
    queryKey: queryKeys.clubs.liked(size),
    queryFn: ({ pageParam }) => getLikedClubs({ cursor: pageParam, size }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });
}

export function useClubDetailQuery(clubId: number, enabled = true) {
  return useQuery({
    queryKey: queryKeys.clubs.detail(clubId),
    queryFn: () => getClubDetail(clubId),
    enabled: enabled && Number.isFinite(clubId),
  });
}

export function useClubArchivesInfiniteQuery(
  clubId: number,
  size = DEFAULT_PAGE_SIZE,
  enabled = true,
) {
  return useInfiniteQuery({
    queryKey: queryKeys.clubs.archives(clubId, size),
    queryFn: ({ pageParam }) =>
      getClubArchives(clubId, { cursor: pageParam, size }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    enabled: enabled && Number.isFinite(clubId),
  });
}

export function useClubMeetingsInfiniteQuery(
  clubId: number,
  size = DEFAULT_PAGE_SIZE,
  enabled = true,
) {
  return useInfiniteQuery({
    queryKey: queryKeys.clubs.meetings(clubId, size),
    queryFn: ({ pageParam }) =>
      getClubMeetings(clubId, { cursor: pageParam, size }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    enabled: enabled && Number.isFinite(clubId),
  });
}

export function useClubMeetingDetailQuery(
  clubId: number,
  meetingId: number,
  enabled = true,
) {
  return useQuery({
    queryKey: queryKeys.clubs.meeting(clubId, meetingId),
    queryFn: () => getClubMeetingDetail(clubId, meetingId),
    enabled:
      enabled && Number.isFinite(clubId) && Number.isFinite(meetingId),
  });
}

export function useClubMeetingAttendeesInfiniteQuery(
  clubId: number,
  meetingId: number,
  size = DEFAULT_PAGE_SIZE,
  enabled = true,
) {
  return useInfiniteQuery({
    queryKey: queryKeys.clubs.meetingAttendees(clubId, meetingId, size),
    queryFn: ({ pageParam }) =>
      getClubMeetingAttendees(clubId, meetingId, { cursor: pageParam, size }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    enabled:
      enabled && Number.isFinite(clubId) && Number.isFinite(meetingId),
  });
}

export function useClubPostsInfiniteQuery(
  clubId: number,
  category?: ClubPostCategory | "ALL",
  size = DEFAULT_PAGE_SIZE,
  enabled = true,
) {
  return useInfiniteQuery({
    queryKey: queryKeys.clubs.posts(clubId, size, category),
    queryFn: ({ pageParam }) =>
      getClubPosts(clubId, { cursor: pageParam, size, category }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    enabled: enabled && Number.isFinite(clubId),
  });
}

export function useJoinClubMutation(clubId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: IJoinClubRequest) => joinClub(clubId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.clubs.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.clubs.detail(clubId) });
    },
  });
}

export function useLeaveClubMutation(clubId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => leaveClub(clubId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.clubs.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.clubs.detail(clubId) });
    },
  });
}

export function useLikeClubMutation(clubId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => likeClub(clubId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.clubs.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.clubs.detail(clubId) });
    },
  });
}

export function useUnlikeClubMutation(clubId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => unlikeClub(clubId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.clubs.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.clubs.detail(clubId) });
    },
  });
}

export function useAttendClubMeetingMutation(
  clubId: number,
  meetingId: number,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => attendClubMeeting(clubId, meetingId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.clubs.meetings(clubId, DEFAULT_PAGE_SIZE),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.clubs.meeting(clubId, meetingId),
      });
    },
  });
}

export function useCancelClubMeetingAttendanceMutation(
  clubId: number,
  meetingId: number,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => cancelClubMeetingAttendance(clubId, meetingId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.clubs.meetings(clubId, DEFAULT_PAGE_SIZE),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.clubs.meeting(clubId, meetingId),
      });
    },
  });
}
