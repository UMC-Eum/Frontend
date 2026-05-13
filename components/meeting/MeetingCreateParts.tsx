import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  LayoutChangeEvent,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
} from "react-native";
//깃헙 웹훅 테스트 주석
export type MeetingJoinType = "free" | "approval";

export const MEETING_COLORS = {
  pink: "#FF3E70",
  text: "#202020",
  gray700: "#636970",
  gray500: "#A6AFB6",
  gray300: "#DEE3E5",
  gray150: "#E9ECED",
  gray100: "#F8FAFB",
  pink50: "#FFF0F2",
  white: "#FFFFFF",
};

interface MeetingFieldSectionProps {
  label: string;
  optional?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  onLayout?: (event: LayoutChangeEvent) => void;
  children: React.ReactNode;
}

export function MeetingFieldSection({
  label,
  optional = false,
  icon,
  onLayout,
  children,
}: MeetingFieldSectionProps) {
  return (
    <View style={styles.section} onLayout={onLayout}>
      <View style={styles.labelRow}>
        {icon ? (
          <Ionicons name={icon} size={24} color={MEETING_COLORS.gray700} />
        ) : null}
        <Text style={styles.label}>
          {label}
          {optional ? (
            <Text style={styles.optional}> (선택)</Text>
          ) : (
            <Text style={styles.required}> *</Text>
          )}
        </Text>
      </View>
      {children}
    </View>
  );
}

interface MeetingInputProps extends TextInputProps {
  minHeight?: number;
  showCounter?: boolean;
  hasError?: boolean;
  errorMessage?: string;
}

export function MeetingInput({
  minHeight = 48,
  showCounter = false,
  maxLength,
  multiline,
  hasError = false,
  errorMessage,
  style,
  ...props
}: MeetingInputProps) {
  const currentLength = String(props.value ?? "").length;

  return (
    <View style={styles.inputWrap}>
      <View
        style={[
          styles.inputBox,
          { minHeight },
          hasError && styles.inputBoxError,
        ]}
      >
        <TextInput
          {...props}
          multiline={multiline}
          maxLength={maxLength}
          placeholderTextColor={MEETING_COLORS.gray500}
          textAlignVertical={multiline ? "top" : "center"}
          style={[styles.input, multiline && styles.multilineInput, style]}
        />
        {showCounter && maxLength ? (
          <Text style={[styles.counter, hasError && styles.counterError]}>
            {currentLength}/{maxLength}
          </Text>
        ) : null}
      </View>
      {hasError && errorMessage ? (
        <Text style={styles.errorMessage}>{errorMessage}</Text>
      ) : null}
    </View>
  );
}

interface MeetingMemberCounterProps {
  value: number;
  onDecrease: () => void;
  onIncrease: () => void;
}

export function MeetingMemberCounter({
  value,
  onDecrease,
  onIncrease,
}: MeetingMemberCounterProps) {
  return (
    <View style={styles.memberRow}>
      <View style={styles.memberValueBox}>
        <Text style={styles.memberCount}>{value}</Text>
        <Text style={styles.memberUnit}>명</Text>
      </View>
      <View style={styles.stepper}>
        <Pressable
          style={styles.stepperButtonLeft}
          onPress={onDecrease}
          hitSlop={8}
        >
          <Ionicons name="remove" size={22} color={MEETING_COLORS.gray500} />
        </Pressable>
        <Pressable
          style={styles.stepperButtonRight}
          onPress={onIncrease}
          hitSlop={8}
        >
          <Ionicons name="add" size={22} color={MEETING_COLORS.gray500} />
        </Pressable>
      </View>
    </View>
  );
}

interface MeetingJoinOptionProps {
  title: string;
  description: string;
  selected: boolean;
  onPress: () => void;
}

export function MeetingJoinOption({
  title,
  description,
  selected,
  onPress,
}: MeetingJoinOptionProps) {
  return (
    <Pressable
      style={[styles.optionCard, selected && styles.optionCardSelected]}
      onPress={onPress}
    >
      <Text
        style={[styles.optionTitle, selected && styles.optionTitleSelected]}
      >
        {title}
      </Text>
      <Text style={styles.optionDescription}>{description}</Text>
    </Pressable>
  );
}

interface MeetingSummaryCardProps {
  title: string;
  dateText: string;
  location: string;
  cost: string;
  style?: ViewStyle;
}

export function MeetingSummaryCard({
  title,
  dateText,
  location,
  cost,
  style,
}: MeetingSummaryCardProps) {
  return (
    <View style={[styles.summaryCard, style]}>
      <View style={styles.summaryTitleRow}>
        <View style={styles.ddayBadge}>
          <Text style={styles.ddayText}>D-4</Text>
        </View>
        <Text style={styles.summaryTitle} numberOfLines={1}>
          {title}
        </Text>
      </View>
      <View style={styles.summaryRows}>
        <SummaryRow label="일시" value={dateText} />
        <SummaryRow label="위치" value={location} />
        <SummaryRow label="비용" value={cost} />
      </View>
    </View>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.summaryRow}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={styles.summaryValue}>{value}</Text>
    </View>
  );
}

interface ShareActionProps {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  variant: "kakao" | "copy" | "share";
  onPress?: () => void;
}

export function ShareAction({
  label,
  icon,
  variant,
  onPress,
}: ShareActionProps) {
  return (
    <Pressable style={styles.shareAction} onPress={onPress}>
      <View style={[styles.shareIconCircle, styles[`${variant}Circle`]]}>
        <Ionicons
          name={icon}
          size={variant === "kakao" ? 30 : 28}
          color={variant === "kakao" ? "#000000" : MEETING_COLORS.gray700}
        />
      </View>
      <Text style={styles.shareLabel}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: MEETING_COLORS.white,
    gap: 12,
  },
  labelRow: {
    minHeight: 24,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  label: {
    color: MEETING_COLORS.text,
    fontSize: 18,
    fontWeight: "600",
    lineHeight: 23,
  },
  required: {
    color: MEETING_COLORS.pink,
  },
  optional: {
    color: MEETING_COLORS.gray500,
    fontSize: 16,
    fontWeight: "500",
  },
  inputWrap: {
    width: "100%",
    gap: 6,
  },
  inputBox: {
    width: "100%",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(222, 227, 229, 0.4)",
    backgroundColor: MEETING_COLORS.gray100,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  inputBoxError: {
    borderColor: MEETING_COLORS.pink,
    backgroundColor: MEETING_COLORS.pink50,
  },
  input: {
    flex: 1,
    padding: 0,
    color: MEETING_COLORS.text,
    fontSize: 18,
    fontWeight: "500",
    lineHeight: 23,
  },
  multilineInput: {
    minHeight: 64,
  },
  counter: {
    color: MEETING_COLORS.gray500,
    fontSize: 14,
    fontWeight: "500",
    lineHeight: 20,
    textAlign: "right",
    marginTop: 4,
  },
  counterError: {
    color: MEETING_COLORS.pink,
  },
  errorMessage: {
    color: MEETING_COLORS.pink,
    fontSize: 13,
    fontWeight: "500",
    lineHeight: 18,
  },
  memberRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  memberValueBox: {
    flex: 1,
    height: 42,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: MEETING_COLORS.gray150,
    backgroundColor: MEETING_COLORS.white,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  memberCount: {
    color: MEETING_COLORS.text,
    fontSize: 20,
    fontWeight: "600",
    lineHeight: 25,
  },
  memberUnit: {
    color: MEETING_COLORS.text,
    fontSize: 18,
    fontWeight: "500",
    lineHeight: 23,
  },
  stepper: {
    height: 42,
    flexDirection: "row",
    alignItems: "center",
  },
  stepperButtonLeft: {
    width: 41,
    height: 42,
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
    borderWidth: 1,
    borderColor: MEETING_COLORS.gray300,
    backgroundColor: MEETING_COLORS.gray100,
    alignItems: "center",
    justifyContent: "center",
  },
  stepperButtonRight: {
    width: 41,
    height: 42,
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
    borderWidth: 1,
    borderLeftWidth: 0,
    borderColor: MEETING_COLORS.gray300,
    backgroundColor: MEETING_COLORS.gray100,
    alignItems: "center",
    justifyContent: "center",
  },
  optionCard: {
    flex: 1,
    height: 66,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: MEETING_COLORS.gray150,
    backgroundColor: MEETING_COLORS.white,
    padding: 12,
    justifyContent: "center",
  },
  optionCardSelected: {
    borderWidth: 2,
    borderColor: MEETING_COLORS.pink,
    backgroundColor: MEETING_COLORS.pink50,
  },
  optionTitle: {
    color: MEETING_COLORS.text,
    fontSize: 16,
    fontWeight: "600",
    lineHeight: 24,
  },
  optionTitleSelected: {
    color: MEETING_COLORS.pink,
    fontWeight: "700",
  },
  optionDescription: {
    color: MEETING_COLORS.gray700,
    fontSize: 14,
    fontWeight: "500",
    lineHeight: 20,
  },
  summaryCard: {
    width: "100%",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: MEETING_COLORS.gray150,
    backgroundColor: MEETING_COLORS.white,
    paddingHorizontal: 24,
    paddingVertical: 16,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    gap: 12,
  },
  summaryTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  ddayBadge: {
    height: 24,
    borderRadius: 12,
    paddingHorizontal: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: MEETING_COLORS.pink,
  },
  ddayText: {
    color: MEETING_COLORS.white,
    fontSize: 12,
    fontWeight: "500",
    lineHeight: 20,
  },
  summaryTitle: {
    flex: 1,
    color: MEETING_COLORS.text,
    fontSize: 20,
    fontWeight: "600",
    lineHeight: 25,
  },
  summaryRows: {
    gap: 0,
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  summaryLabel: {
    color: MEETING_COLORS.gray700,
    fontSize: 16,
    fontWeight: "500",
    lineHeight: 24,
  },
  summaryValue: {
    flex: 1,
    color: MEETING_COLORS.text,
    fontSize: 16,
    fontWeight: "500",
    lineHeight: 24,
  },
  shareAction: {
    width: 64,
    alignItems: "center",
    gap: 4,
  },
  shareIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  kakaoCircle: {
    backgroundColor: "#FEE500",
  },
  copyCircle: {
    backgroundColor: MEETING_COLORS.gray300,
  },
  shareCircle: {
    backgroundColor: MEETING_COLORS.gray300,
  },
  shareLabel: {
    color: MEETING_COLORS.gray700,
    fontSize: 14,
    fontWeight: "500",
    lineHeight: 20,
    textAlign: "center",
  },
});
