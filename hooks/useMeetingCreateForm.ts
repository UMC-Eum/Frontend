import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import { ScrollView } from "react-native";

import { useCreateMeetingMutation } from "@/hooks/api/useMeetings";
import type { ClubJoinPolicy } from "@/types/api/club/clubDTO";

import type { MeetingJoinType } from "@/components/meeting/MeetingCreateParts";
import type { MeetingScheduleForm } from "@/components/meeting/meetingSchedule";
import {
  buildMeetingRecurrence,
  getScheduleSummary,
} from "@/components/meeting/meetingSchedule";
import type { IMeetingCreateRequest } from "@/types/api/meetings/meetingsDTO";

type RequiredMeetingField = "title" | "intro" | "schedule" | "location";

const REQUIRED_FIELD_MESSAGES: Record<RequiredMeetingField, string> = {
  title: "모임 제목을 입력해주세요.",
  intro: "모임 소개를 입력해주세요.",
  schedule: "정기모임 일정을 선택해주세요.",
  location: "정기모임 위치를 입력해주세요.",
};

export function useMeetingCreateForm(clubId: number) {
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);
  const sectionOffsets = useRef<Record<RequiredMeetingField, number>>({
    title: 0,
    intro: 0,
    schedule: 0,
    location: 0,
  });
  const createMeetingMutation = useCreateMeetingMutation(clubId);

  const [title, setTitle] = useState("");
  const [intro, setIntro] = useState("");
  const [schedule, setSchedule] = useState<MeetingScheduleForm | null>(null);
  const [isSchedulePickerVisible, setSchedulePickerVisible] = useState(false);
  const [location, setLocation] = useState("");
  const [cost, setCost] = useState("");
  const [maxMembers, setMaxMembers] = useState(15);
  const [joinType, setJoinType] = useState<MeetingJoinType>("free");
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState("");

  const requiredValues: Record<RequiredMeetingField, boolean> = {
    title: title.trim().length > 0,
    intro: intro.trim().length > 0,
    schedule: !!schedule,
    location: location.trim().length > 0,
  };

  const getFieldError = (field: RequiredMeetingField) => {
    if (!submitted || requiredValues[field]) {
      return "";
    }

    return REQUIRED_FIELD_MESSAGES[field];
  };

  const getFirstInvalidField = () =>
    (Object.keys(requiredValues) as RequiredMeetingField[]).find(
      (field) => !requiredValues[field],
    );

  const firstInvalidField = submitted ? getFirstInvalidField() : undefined;
  const validationWarning = firstInvalidField
    ? REQUIRED_FIELD_MESSAGES[firstInvalidField]
    : formError;

  const handleSectionLayout =
    (field: RequiredMeetingField) =>
    (event: { nativeEvent: { layout: { y: number } } }) => {
      sectionOffsets.current[field] = event.nativeEvent.layout.y;
    };

  const decreaseMembers = () => {
    setMaxMembers((current) => Math.max(2, current - 1));
  };

  const increaseMembers = () => {
    setMaxMembers((current) => Math.min(99, current + 1));
  };

  const openSchedulePicker = () => {
    setSchedulePickerVisible(true);
  };

  const closeSchedulePicker = () => {
    setSchedulePickerVisible(false);
  };

  const confirmSchedule = (nextSchedule: MeetingScheduleForm) => {
    setSchedule(nextSchedule);
    setSchedulePickerVisible(false);
  };

  const handleSubmit = async () => {
    setSubmitted(true);
    setFormError("");

    const nextInvalidField = getFirstInvalidField();

    if (nextInvalidField) {
      scrollViewRef.current?.scrollTo({
        y: Math.max(sectionOffsets.current[nextInvalidField] - 8, 0),
        animated: true,
      });
      return;
    }

    if (!Number.isFinite(clubId)) {
      setFormError("동호회 정보를 찾을 수 없어요.");
      return;
    }

    if (!schedule) {
      return;
    }

    const scheduleSummary = getScheduleSummary(schedule);
    const trimmedCost = cost.trim();
    const joinPolicy: ClubJoinPolicy =
      joinType === "free" ? "AUTO" : "APPROVAL";

    const meetingCreateBody: IMeetingCreateRequest = {
      name: title.trim(),
      introText: intro.trim(),
      spot: location.trim(),
      capacity: maxMembers,
      joinPolicy,
      recurrence: buildMeetingRecurrence(schedule),
      ...(trimmedCost.length > 0 ? { cost: trimmedCost } : {}),
    };

    try {
      const createdMeeting =
        await createMeetingMutation.mutateAsync(meetingCreateBody);

      router.push({
        pathname: "/meeting-create-complete",
        params: {
          clubId: String(createdMeeting.clubId),
          meetingId: String(createdMeeting.meetingId),
          title: createdMeeting.name,
          dateText: scheduleSummary.label,
          nextDateLabel: scheduleSummary.nextDateLabel,
          ddayText: scheduleSummary.ddayText,
          location: createdMeeting.spot,
          cost: createdMeeting.cost ?? trimmedCost,
        },
      } as never);
    } catch {
      setFormError("정기모임 생성에 실패했어요. 잠시 후 다시 시도해주세요.");
    }
  };

  return {
    scrollViewRef,
    title,
    setTitle,
    intro,
    setIntro,
    schedule,
    isSchedulePickerVisible,
    openSchedulePicker,
    closeSchedulePicker,
    confirmSchedule,
    location,
    setLocation,
    cost,
    setCost,
    maxMembers,
    decreaseMembers,
    increaseMembers,
    joinType,
    setJoinType,
    getFieldError,
    validationWarning,
    handleSectionLayout,
    handleSubmit,
    isSubmitting: createMeetingMutation.isPending,
  };
}
