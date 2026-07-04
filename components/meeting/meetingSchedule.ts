import type {
  IMeetingRecurrence,
  MeetingRecurrenceType,
  MeetingWeekday,
} from "@/types/api/meetings/meetingsDTO";

export type MeetingMeridiem = "AM" | "PM";

export interface MeetingScheduleForm {
  recurrenceType: MeetingRecurrenceType;
  weekday: MeetingWeekday;
  dayOfMonth: number;
  meridiem: MeetingMeridiem;
  hour12: number;
  minute: number;
}

export const DEFAULT_MEETING_SCHEDULE: MeetingScheduleForm = {
  recurrenceType: "WEEKLY",
  weekday: "THU",
  dayOfMonth: 1,
  meridiem: "PM",
  hour12: 7,
  minute: 0,
};

export const WEEKDAY_OPTIONS: {
  label: string;
  fullLabel: string;
  value: MeetingWeekday;
  dateIndex: number;
}[] = [
  { label: "월", fullLabel: "월요일", value: "MON", dateIndex: 1 },
  { label: "화", fullLabel: "화요일", value: "TUE", dateIndex: 2 },
  { label: "수", fullLabel: "수요일", value: "WED", dateIndex: 3 },
  { label: "목", fullLabel: "목요일", value: "THU", dateIndex: 4 },
  { label: "금", fullLabel: "금요일", value: "FRI", dateIndex: 5 },
  { label: "토", fullLabel: "토요일", value: "SAT", dateIndex: 6 },
  { label: "일", fullLabel: "일요일", value: "SUN", dateIndex: 0 },
];

export const RECURRENCE_OPTIONS: {
  label: string;
  value: MeetingRecurrenceType;
}[] = [
  { label: "매일", value: "DAILY" },
  { label: "매주", value: "WEEKLY" },
  { label: "매달", value: "MONTHLY" },
];

const DAY_MS = 24 * 60 * 60 * 1000;

export function to24Hour(schedule: MeetingScheduleForm) {
  const normalizedHour = schedule.hour12 % 12;
  return schedule.meridiem === "PM" ? normalizedHour + 12 : normalizedHour;
}

export function getNextOccurrence(
  schedule: MeetingScheduleForm,
  from = new Date(),
) {
  const hour = to24Hour(schedule);
  const next = new Date(from);
  next.setSeconds(0, 0);
  next.setHours(hour, schedule.minute, 0, 0);

  if (schedule.recurrenceType === "DAILY") {
    if (next.getTime() <= from.getTime()) {
      next.setDate(next.getDate() + 1);
    }
    return next;
  }

  if (schedule.recurrenceType === "WEEKLY") {
    const targetDay = WEEKDAY_OPTIONS.find(
      (day) => day.value === schedule.weekday,
    )?.dateIndex;
    const currentDay = next.getDay();
    const diff = ((targetDay ?? currentDay) - currentDay + 7) % 7;
    next.setDate(next.getDate() + diff);
    if (next.getTime() <= from.getTime()) {
      next.setDate(next.getDate() + 7);
    }
    return next;
  }

  const targetDayOfMonth = Math.max(1, Math.min(31, schedule.dayOfMonth));
  next.setDate(
    Math.min(targetDayOfMonth, getDaysInMonth(next.getFullYear(), next.getMonth())),
  );
  if (next.getTime() <= from.getTime()) {
    next.setMonth(next.getMonth() + 1, 1);
    next.setDate(
      Math.min(targetDayOfMonth, getDaysInMonth(next.getFullYear(), next.getMonth())),
    );
  }
  return next;
}

export function buildMeetingRecurrence(
  schedule: MeetingScheduleForm,
): IMeetingRecurrence {
  const recurrence: IMeetingRecurrence = {
    type: schedule.recurrenceType,
    hour: to24Hour(schedule),
    minute: schedule.minute,
  };

  if (schedule.recurrenceType === "WEEKLY") {
    return {
      ...recurrence,
      daysOfWeek: [schedule.weekday],
    };
  }

  if (schedule.recurrenceType === "MONTHLY") {
    return {
      ...recurrence,
      dayOfMonth: schedule.dayOfMonth,
    };
  }

  return recurrence;
}

export function getScheduleSummary(schedule: MeetingScheduleForm) {
  const nextOccurrence = getNextOccurrence(schedule);

  return {
    label: formatScheduleLabel(schedule),
    nextOccurrenceAt: nextOccurrence.toISOString(),
    nextDateLabel: formatOccurrenceDate(nextOccurrence),
    ddayText: formatDday(nextOccurrence),
  };
}

export function formatScheduleLabel(schedule: MeetingScheduleForm) {
  const periodLabel = schedule.meridiem === "AM" ? "오전" : "오후";
  const hourLabel = `${schedule.hour12}시`;

  if (schedule.recurrenceType === "DAILY") {
    return `매일 ${periodLabel} ${hourLabel}`;
  }

  if (schedule.recurrenceType === "WEEKLY") {
    const weekday = WEEKDAY_OPTIONS.find(
      (day) => day.value === schedule.weekday,
    )?.fullLabel;
    return `매주 ${weekday ?? ""} ${periodLabel} ${hourLabel}`.trim();
  }

  return `매달 ${schedule.dayOfMonth}일 ${periodLabel} ${hourLabel}`;
}

export function formatOccurrenceDate(date: Date) {
  const weekdayLabel = WEEKDAY_OPTIONS.find(
    (day) => day.dateIndex === date.getDay(),
  )?.label;

  return `${date.getMonth() + 1}월 ${date.getDate()}일 (${weekdayLabel ?? ""})`;
}

export function formatDday(date: Date | string) {
  const target = typeof date === "string" ? new Date(date) : new Date(date);
  const now = new Date();

  if (Number.isNaN(target.getTime())) {
    return "D-?";
  }

  const targetStart = new Date(target);
  const nowStart = new Date(now);
  targetStart.setHours(0, 0, 0, 0);
  nowStart.setHours(0, 0, 0, 0);

  const diffDays = Math.ceil(
    (targetStart.getTime() - nowStart.getTime()) / DAY_MS,
  );

  if (diffDays === 0) return "D-Day";
  return diffDays > 0 ? `D-${diffDays}` : `D+${Math.abs(diffDays)}`;
}

export function formatCompactDate(value?: string | null) {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return `${String(date.getMonth() + 1).padStart(2, "0")}.${String(
    date.getDate(),
  ).padStart(2, "0")}`;
}

export function formatJoinedDate(value?: string | null) {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(
    2,
    "0",
  )}.${String(date.getDate()).padStart(2, "0")}`;
}

function getDaysInMonth(year: number, monthIndex: number) {
  return new Date(year, monthIndex + 1, 0).getDate();
}
