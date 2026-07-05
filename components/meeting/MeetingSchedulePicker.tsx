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
  HOUR12_OPTIONS,
  MERIDIEM_OPTIONS,
  MINUTE_OPTIONS,
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
  const [openDropdown, setOpenDropdown] = useState<TimeDropdownKey | null>(
    null,
  );

  useEffect(() => {
    if (visible) {
      setDraft(value ?? DEFAULT_MEETING_SCHEDULE);
      setOpenDropdown(null);
    }
  }, [value, visible]);

  const updateDraft = (next: Partial<MeetingScheduleForm>) => {
    setDraft((current) => ({ ...current, ...next }));
  };

  const toggleDropdown = (key: TimeDropdownKey) => {
    setOpenDropdown((current) => (current === key ? null : key));
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
              <View style={styles.timeDropdownRow}>
                <TimeDropdown
                  options={MERIDIEM_OPTIONS}
                  selected={draft.meridiem}
                  isOpen={openDropdown === "meridiem"}
                  onToggle={() => toggleDropdown("meridiem")}
                  onSelect={(meridiem) => {
                    updateDraft({ meridiem });
                    setOpenDropdown(null);
                  }}
                />
                <TimeDropdown
                  options={HOUR12_OPTIONS}
                  selected={draft.hour12}
                  isOpen={openDropdown === "hour"}
                  onToggle={() => toggleDropdown("hour")}
                  onSelect={(hour12) => {
                    updateDraft({ hour12 });
                    setOpenDropdown(null);
                  }}
                />
                <TimeDropdown
                  options={MINUTE_OPTIONS}
                  selected={draft.minute}
                  isOpen={openDropdown === "minute"}
                  onToggle={() => toggleDropdown("minute")}
                  onSelect={(minute) => {
                    updateDraft({ minute });
                    setOpenDropdown(null);
                  }}
                />
              </View>
            </PickerSection>

            {openDropdown ? <View style={styles.dropdownSpacer} /> : null}
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

type TimeDropdownKey = "meridiem" | "hour" | "minute";

function TimeDropdown<T extends string | number>({
  options,
  selected,
  isOpen,
  onToggle,
  onSelect,
}: {
  options: { label: string; value: T }[];
  selected: T;
  isOpen: boolean;
  onToggle: () => void;
  onSelect: (value: T) => void;
}) {
  const selectedLabel =
    options.find((option) => option.value === selected)?.label ?? "";

  return (
    <View style={[styles.dropdownWrap, isOpen && styles.dropdownWrapOpen]}>
      <Pressable
        style={[styles.dropdownBox, isOpen && styles.dropdownBoxOpen]}
        onPress={onToggle}
        accessibilityRole="button"
        accessibilityLabel={selectedLabel}
        accessibilityState={{ expanded: isOpen }}
      >
        <Text
          style={[styles.dropdownLabel, isOpen && styles.dropdownLabelOpen]}
        >
          {selectedLabel}
        </Text>
        <Ionicons
          name={isOpen ? "chevron-up" : "chevron-down"}
          size={18}
          color={isOpen ? MEETING_COLORS.pink : MEETING_COLORS.gray500}
        />
      </Pressable>

      {isOpen ? (
        <View style={styles.dropdownMenu}>
          <ScrollView
            style={styles.dropdownMenuScroll}
            nestedScrollEnabled
            showsVerticalScrollIndicator
          >
            {options.map((option) => {
              const isSelected = option.value === selected;

              return (
                <Pressable
                  key={String(option.value)}
                  style={styles.dropdownItem}
                  onPress={() => onSelect(option.value)}
                  accessibilityRole="button"
                  accessibilityLabel={option.label}
                  accessibilityState={{ selected: isSelected }}
                >
                  <Text
                    style={[
                      styles.dropdownItemText,
                      isSelected && styles.dropdownItemTextSelected,
                    ]}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      ) : null}
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
  flexChip: {
    flex: 1,
    alignSelf: "stretch",
    height: 42,
    paddingVertical: 0,
    borderRadius: 7,
  },
  weekdayRow: {
    flexDirection: "row",
    gap: 12,
  },
  weekdayChip: {
    flex: 1,
    alignSelf: "stretch",
    height: 42,
    paddingHorizontal: 0,
    paddingVertical: 0,
    borderRadius: 21,
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
  timeDropdownRow: {
    flexDirection: "row",
    gap: 12,
  },
  dropdownWrap: {
    flex: 1,
  },
  dropdownWrapOpen: {
    zIndex: 30,
  },
  dropdownBox: {
    height: 42,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: MEETING_COLORS.gray300,
    backgroundColor: MEETING_COLORS.gray100,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 4,
  },
  dropdownBoxOpen: {
    borderColor: MEETING_COLORS.pink,
  },
  dropdownLabel: {
    color: MEETING_COLORS.text,
    fontSize: 16,
    fontWeight: "500",
    lineHeight: 24,
  },
  dropdownLabelOpen: {
    color: MEETING_COLORS.pink,
  },
  dropdownMenu: {
    position: "absolute",
    top: 46,
    left: 0,
    right: 0,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: MEETING_COLORS.gray300,
    backgroundColor: MEETING_COLORS.white,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 8,
    overflow: "hidden",
  },
  dropdownMenuScroll: {
    maxHeight: 150,
  },
  dropdownItem: {
    height: 38,
    paddingHorizontal: 16,
    justifyContent: "center",
  },
  dropdownItemText: {
    color: MEETING_COLORS.text,
    fontSize: 16,
    fontWeight: "500",
    lineHeight: 24,
  },
  dropdownItemTextSelected: {
    color: MEETING_COLORS.pink,
  },
  dropdownSpacer: {
    height: 160,
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
