import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Chip } from "@/components/Chip";

import { MEETING_COLORS } from "./MeetingCreateParts";
import {
  DEFAULT_MEETING_SCHEDULE,
  MeetingScheduleForm,
  RECURRENCE_OPTIONS,
  WEEKDAY_OPTIONS,
  getScheduleSummary,
} from "./meetingSchedule";

interface MeetingScheduleFieldProps {
  value: MeetingScheduleForm | null;
  hasError?: boolean;
  errorMessage?: string;
  onPress: () => void;
}

export function MeetingScheduleField({
  value,
  hasError = false,
  errorMessage,
  onPress,
}: MeetingScheduleFieldProps) {
  const summary = value ? getScheduleSummary(value) : null;

  return (
    <View style={styles.fieldWrap}>
      <Pressable
        style={[
          styles.scheduleField,
          summary && styles.scheduleFieldSelected,
          hasError && styles.scheduleFieldError,
        ]}
        onPress={onPress}
      >
        {summary ? (
          <>
            <Ionicons name="calendar" size={28} color={MEETING_COLORS.pink} />
            <View style={styles.scheduleTextBlock}>
              <Text style={styles.scheduleTitle}>{summary.label}</Text>
              <View style={styles.scheduleMetaRow}>
                <Text style={styles.scheduleMeta}>다음 모임</Text>
                <Text style={styles.scheduleDot}>·</Text>
                <Text style={styles.scheduleMeta}>{summary.nextDateLabel}</Text>
                <Text style={styles.scheduleDot}>·</Text>
                <Text style={styles.scheduleDday}>{summary.ddayText}</Text>
              </View>
            </View>
            <Ionicons
              name="chevron-down"
              size={22}
              color={MEETING_COLORS.pink}
            />
          </>
        ) : (
          <>
            <Text style={styles.schedulePlaceholder}>일정 선택</Text>
            <Ionicons
              name="chevron-down"
              size={22}
              color={MEETING_COLORS.gray500}
            />
          </>
        )}
      </Pressable>
      {hasError && errorMessage ? (
        <Text style={styles.errorMessage}>{errorMessage}</Text>
      ) : null}
    </View>
  );
}

interface MeetingSchedulePickerProps {
  visible: boolean;
  value: MeetingScheduleForm | null;
  onConfirm: (value: MeetingScheduleForm) => void;
  onClose: () => void;
}

export function MeetingSchedulePicker({
  visible,
  value,
  onConfirm,
  onClose,
}: MeetingSchedulePickerProps) {
  const insets = useSafeAreaInsets();
  const [draft, setDraft] = useState<MeetingScheduleForm>(
    value ?? DEFAULT_MEETING_SCHEDULE,
  );

  useEffect(() => {
    if (visible) {
      setDraft(value ?? DEFAULT_MEETING_SCHEDULE);
    }
  }, [value, visible]);

  const updateDraft = (next: Partial<MeetingScheduleForm>) => {
    setDraft((current) => ({ ...current, ...next }));
  };

  const handleConfirm = () => {
    onConfirm(draft);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalRoot}>
        <Pressable style={styles.overlay} onPress={onClose} />
        <View style={[styles.sheet, { paddingBottom: insets.bottom + 48 }]}>
          <View style={styles.handle} />
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.sheetContent}
          >
            <PickerSection label="주기">
              <View style={styles.threeColumnRow}>
                {RECURRENCE_OPTIONS.map((option) => (
                  <Chip
                    key={option.value}
                    label={option.label}
                    shape="rect"
                    size="medium"
                    variant={
                      draft.recurrenceType === option.value
                        ? "outlineActive"
                        : "outline"
                    }
                    onPress={() => updateDraft({ recurrenceType: option.value })}
                    style={styles.flexChip}
                    textStyle={
                      draft.recurrenceType === option.value
                        ? styles.activeChipText
                        : styles.defaultChipText
                    }
                  />
                ))}
              </View>
            </PickerSection>

            {draft.recurrenceType === "WEEKLY" ? (
              <PickerSection label="요일">
                <View style={styles.weekdayRow}>
                  {WEEKDAY_OPTIONS.map((option) => (
                    <Chip
                      key={option.value}
                      label={option.label}
                      shape="pill"
                      size="medium"
                      variant={
                        draft.weekday === option.value ? "solid" : "outline"
                      }
                      onPress={() => updateDraft({ weekday: option.value })}
                      style={styles.weekdayChip}
                      textStyle={
                        draft.weekday === option.value
                          ? styles.selectedChipText
                          : option.value === "SUN"
                            ? styles.sundayText
                            : styles.defaultChipText
                      }
                    />
                  ))}
                </View>
              </PickerSection>
            ) : null}

            {draft.recurrenceType === "MONTHLY" ? (
              <PickerSection label="날짜">
                <View style={styles.dayGrid}>
                  {Array.from({ length: 31 }, (_, index) => index + 1).map(
                    (day) => (
                      <Chip
                        key={day}
                        label={String(day)}
                        shape="pill"
                        size="medium"
                        variant={draft.dayOfMonth === day ? "solid" : "outline"}
                        onPress={() => updateDraft({ dayOfMonth: day })}
                        style={styles.dayChip}
                        textStyle={
                          draft.dayOfMonth === day
                            ? styles.selectedChipText
                            : styles.defaultChipText
                        }
                      />
                    ),
                  )}
                </View>
              </PickerSection>
            ) : null}

            <PickerSection label="시간">
              <View style={styles.timeGroup}>
                <OptionRow
                  options={["AM", "PM"]}
                  getLabel={(option) => (option === "AM" ? "오전" : "오후")}
                  selected={draft.meridiem}
                  onSelect={(meridiem) => updateDraft({ meridiem })}
                />
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.hourRow}
                >
                  {Array.from({ length: 12 }, (_, index) => index + 1).map(
                    (hour) => (
                      <Chip
                        key={hour}
                        label={`${String(hour).padStart(2, "0")}시`}
                        shape="rect"
                        size="small"
                        variant={
                          draft.hour12 === hour ? "outlineActive" : "outline"
                        }
                        onPress={() => updateDraft({ hour12: hour })}
                        style={styles.timeChip}
                        textStyle={
                          draft.hour12 === hour
                            ? styles.activeChipText
                            : styles.defaultChipText
                        }
                      />
                    ),
                  )}
                </ScrollView>
                <OptionRow
                  options={[0, 30]}
                  getLabel={(option) => `${String(option).padStart(2, "0")}분`}
                  selected={draft.minute}
                  onSelect={(minute) => updateDraft({ minute })}
                />
              </View>
            </PickerSection>
          </ScrollView>

          <Pressable style={styles.confirmButton} onPress={handleConfirm}>
            <Text style={styles.confirmText}>확인</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

function PickerSection({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.pickerSection}>
      <Text style={styles.pickerLabel}>{label}</Text>
      {children}
    </View>
  );
}

function OptionRow<T extends string | number>({
  options,
  selected,
  getLabel,
  onSelect,
}: {
  options: T[];
  selected: T;
  getLabel: (option: T) => string;
  onSelect: (option: T) => void;
}) {
  return (
    <View style={styles.optionRow}>
      {options.map((option) => (
        <Chip
          key={String(option)}
          label={getLabel(option)}
          shape="rect"
          size="small"
          variant={selected === option ? "outlineActive" : "outline"}
          onPress={() => onSelect(option)}
          style={styles.flexChip}
          textStyle={
            selected === option ? styles.activeChipText : styles.defaultChipText
          }
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
  },
  fieldWrap: {
    width: "100%",
    gap: 6,
  },
  scheduleField: {
    minHeight: 48,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(222, 227, 229, 0.4)",
    backgroundColor: MEETING_COLORS.gray100,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  scheduleFieldSelected: {
    minHeight: 67,
    borderWidth: 1.5,
    borderColor: "#FFCBD6",
    backgroundColor: MEETING_COLORS.pink50,
  },
  scheduleFieldError: {
    borderColor: MEETING_COLORS.pink,
  },
  scheduleTextBlock: {
    flex: 1,
    gap: 1,
  },
  schedulePlaceholder: {
    flex: 1,
    color: MEETING_COLORS.gray500,
    fontSize: 18,
    fontWeight: "500",
    lineHeight: 23,
  },
  scheduleTitle: {
    color: MEETING_COLORS.text,
    fontSize: 18,
    fontWeight: "600",
    lineHeight: 23,
  },
  scheduleMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },
  scheduleMeta: {
    color: MEETING_COLORS.gray700,
    fontSize: 14,
    fontWeight: "500",
    lineHeight: 20,
  },
  scheduleDot: {
    color: MEETING_COLORS.gray700,
    fontSize: 14,
    fontWeight: "500",
    lineHeight: 20,
    marginHorizontal: 4,
  },
  scheduleDday: {
    color: MEETING_COLORS.pink,
    fontSize: 14,
    fontWeight: "500",
    lineHeight: 20,
  },
  errorMessage: {
    color: MEETING_COLORS.pink,
    fontSize: 13,
    fontWeight: "500",
    lineHeight: 18,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  sheet: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    backgroundColor: MEETING_COLORS.white,
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  handle: {
    alignSelf: "center",
    width: 46,
    height: 4,
    borderRadius: 2,
    backgroundColor: MEETING_COLORS.gray300,
    marginBottom: 16,
  },
  sheetContent: {
    gap: 16,
    paddingBottom: 40,
  },
  pickerSection: {
    gap: 12,
  },
  pickerLabel: {
    color: MEETING_COLORS.gray700,
    fontSize: 16,
    fontWeight: "500",
    lineHeight: 24,
  },
  threeColumnRow: {
    flexDirection: "row",
    gap: 12,
  },
  optionRow: {
    flexDirection: "row",
    gap: 12,
  },
  flexChip: {
    flex: 1,
    alignSelf: "stretch",
  },
  weekdayRow: {
    flexDirection: "row",
    gap: 12,
  },
  weekdayChip: {
    flex: 1,
    alignSelf: "stretch",
    paddingHorizontal: 0,
  },
  dayGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  dayChip: {
    width: 42,
    height: 42,
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  timeGroup: {
    gap: 12,
  },
  hourRow: {
    gap: 8,
    paddingRight: 20,
  },
  timeChip: {
    minWidth: 72,
  },
  defaultChipText: {
    color: MEETING_COLORS.text,
    fontWeight: "500",
  },
  activeChipText: {
    color: MEETING_COLORS.pink,
    fontWeight: "500",
  },
  selectedChipText: {
    color: MEETING_COLORS.white,
    fontWeight: "600",
  },
  sundayText: {
    color: "#F03F40",
    fontWeight: "500",
  },
  confirmButton: {
    height: 54,
    borderRadius: 14,
    backgroundColor: MEETING_COLORS.pink,
    alignItems: "center",
    justifyContent: "center",
  },
  confirmText: {
    color: MEETING_COLORS.white,
    fontSize: 18,
    fontWeight: "600",
    lineHeight: 23,
  },
});
