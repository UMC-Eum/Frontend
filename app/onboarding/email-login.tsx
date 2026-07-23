import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { z } from "zod";

import KakaoSymbol from "@/assets/images/kakao-symbol.svg";
import { getAgreementStatus } from "@/api/agreements/agreementsApi";
import {
  useEmailSignupMutation,
  useLocalLoginMutation,
  useSendEmailCodeMutation,
  useVerifyEmailCodeMutation,
} from "@/hooks/api/useAuth";
import { useSocialLogin } from "@/hooks/useSocialLogin";

// ponytail: 심사용 임시 이메일(로컬) 로그인/회원가입 화면. 심사 종료 후 제거 (EUM-191)
const emailSchema = z
  .string()
  .trim()
  .min(1, "이메일을 입력해주세요.")
  .pipe(z.email("올바른 이메일 형식이 아니에요."));

// 로컬 계정은 이메일이 곧 로그인 아이디. API 필드명(username)은 백엔드 계약 유지
const loginSchema = z.object({
  username: emailSchema,
  password: z.string().min(1, "비밀번호를 입력해주세요."),
});

// 백엔드 정책: 비밀번호 8자 이상, 인증번호 6자리
const signupSchema = z
  .object({
    email: emailSchema,
    password: z
      .string()
      .min(1, "비밀번호를 입력해주세요.")
      .min(8, "비밀번호는 8자 이상 입력해주세요."),
    passwordConfirm: z.string().min(1, "비밀번호를 다시 입력해주세요."),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: "비밀번호가 일치하지 않아요.",
    path: ["passwordConfirm"],
  });

const codeSchema = z
  .string()
  .trim()
  .regex(/^\d{6}$/, "인증번호 6자리를 입력해주세요.");

type LoginField = keyof z.infer<typeof loginSchema>;
type SignupField = keyof z.infer<typeof signupSchema>;
type FieldErrors = Partial<Record<LoginField | SignupField, string>>;

// 이메일 인증번호 유효기간(초). 백엔드 정책: 3분
const VERIFICATION_TTL_SECONDS = 180;

function getApiErrorMessage(error: unknown) {
  return (error as {
    response?: { data?: { error?: { message?: string } } };
  }).response?.data?.error?.message;
}

function zodFieldErrors(error: z.ZodError): FieldErrors {
  const errors: FieldErrors = {};
  for (const issue of error.issues) {
    const field = issue.path[0] as keyof FieldErrors;
    if (!errors[field]) errors[field] = issue.message;
  }
  return errors;
}

/**
 * 이메일(로컬) 로그인/회원가입 화면 — 심사용 임시
 * - 상단: 뒤로가기 헤더 + 로그인/회원가입 세그먼트 탭
 * - 로그인: 이메일/비밀번호 입력 → 소셜 로그인과 동일한 온보딩 분기
 * - 회원가입: 이메일 인증(3분 타이머) + 비밀번호/비밀번호 확인
 */
export default function EmailLoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [mode, setMode] = useState<"login" | "signup">("login");

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* 헤더 */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="chevron-back" size={24} color="#000000" />
        </Pressable>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={[
            styles.content,
            { paddingBottom: insets.bottom + 24 },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* 로그인 / 회원가입 세그먼트 탭 */}
          <View style={styles.segmentBox}>
            <Pressable
              style={[
                styles.segment,
                mode === "login" && styles.segmentActive,
              ]}
              onPress={() => setMode("login")}
              accessibilityRole="button"
              accessibilityLabel="로그인 탭"
            >
              <Text
                style={[
                  styles.segmentText,
                  mode === "login" && styles.segmentTextActive,
                ]}
              >
                로그인
              </Text>
            </Pressable>
            <Pressable
              style={[
                styles.segment,
                mode === "signup" && styles.segmentActive,
              ]}
              onPress={() => setMode("signup")}
              accessibilityRole="button"
              accessibilityLabel="회원가입 탭"
            >
              <Text
                style={[
                  styles.segmentText,
                  mode === "signup" && styles.segmentTextActive,
                ]}
              >
                회원가입
              </Text>
            </Pressable>
          </View>

          {mode === "login" ? <LoginForm router={router} /> : <SignupForm />}

          <SnsSection />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

/** 하단 "SNS 계정으로 시작하기" — 카카오/Apple 원형 버튼, 진입 시 살짝 떠오르는 애니메이션 */
function SnsSection() {
  const router = useRouter();
  const {
    handleKakaoLogin,
    handleAppleLogin,
    isLoginPending,
    errorMessage,
    isAppleAuthAvailable,
  } = useSocialLogin({
    onShowTerms: () => router.replace("/onboarding/login?showTerms=1" as any),
  });

  const appear = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(appear, {
      toValue: 1,
      duration: 500,
      delay: 150,
      useNativeDriver: true,
    }).start();
  }, [appear]);

  return (
    <Animated.View
      style={[
        styles.snsSection,
        {
          opacity: appear,
          transform: [
            {
              translateY: appear.interpolate({
                inputRange: [0, 1],
                outputRange: [16, 0],
              }),
            },
          ],
        },
      ]}
    >
      <View style={styles.snsDividerRow}>
        <View style={styles.snsDividerLine} />
        <Text style={styles.snsDividerText}>SNS 계정으로 시작하기</Text>
        <View style={styles.snsDividerLine} />
      </View>

      <View style={styles.snsIconRow}>
        <Pressable
          style={({ pressed }) => [
            styles.snsCircle,
            isLoginPending && styles.snsCircleDisabled,
            pressed && !isLoginPending && styles.snsCirclePressed,
          ]}
          onPress={handleKakaoLogin}
          disabled={isLoginPending}
          accessibilityRole="button"
          accessibilityLabel="카카오로 시작하기"
        >
          <KakaoSymbol width={48} height={48} />
        </Pressable>
        {isAppleAuthAvailable ? (
          <Pressable
            style={({ pressed }) => [
              styles.snsCircle,
              styles.snsAppleCircle,
              isLoginPending && styles.snsCircleDisabled,
              pressed && !isLoginPending && styles.snsCirclePressed,
            ]}
            onPress={handleAppleLogin}
            disabled={isLoginPending}
            accessibilityRole="button"
            accessibilityLabel="Apple로 시작하기"
          >
            <Ionicons name="logo-apple" size={26} color="#FFFFFF" />
          </Pressable>
        ) : null}
      </View>

      {errorMessage ? (
        <Text style={styles.errorText}>{errorMessage}</Text>
      ) : null}
    </Animated.View>
  );
}

function LoginForm({ router }: { router: ReturnType<typeof useRouter> }) {
  const localLoginMutation = useLocalLoginMutation();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLogin = async () => {
    if (localLoginMutation.isPending) return;

    setErrorMessage(null);

    const parsed = loginSchema.safeParse({ username, password });
    if (!parsed.success) {
      setFieldErrors(zodFieldErrors(parsed.error));
      return;
    }

    setFieldErrors({});

    try {
      const auth = await localLoginMutation.mutateAsync(parsed.data);
      const needsOnboarding = auth.onboardingRequired || auth.isNewUser;

      if (needsOnboarding) {
        const hasPassedAgreements = await getAgreementStatus();

        if (hasPassedAgreements) {
          router.replace("/onboarding/permissions" as any);
        } else {
          // 약관 바텀시트는 로그인 화면이 showTerms 파라미터로 처리한다.
          router.replace("/onboarding/login?showTerms=1" as any);
        }
        return;
      }

      router.replace("/(tabs)" as any);
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(error) ?? "로그인에 실패했어요. 다시 시도해주세요.",
      );
    }
  };

  return (
    <View>
      <Text style={styles.title}>이메일로 로그인</Text>
      <Text style={styles.subtitle}>
        가입한 이메일과 비밀번호를 입력해주세요.
      </Text>

      <View style={styles.fieldBox}>
        <Text style={styles.fieldLabel}>이메일</Text>
        <TextInput
          style={styles.input}
          value={username}
          onChangeText={setUsername}
          placeholder="이메일 입력"
          placeholderTextColor="#A6AFB6"
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          returnKeyType="next"
        />
        {fieldErrors.username ? (
          <Text style={styles.fieldErrorText}>{fieldErrors.username}</Text>
        ) : null}
      </View>

      <View style={styles.fieldBox}>
        <Text style={styles.fieldLabel}>비밀번호</Text>
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          placeholder="비밀번호 입력"
          placeholderTextColor="#A6AFB6"
          autoCapitalize="none"
          autoCorrect={false}
          secureTextEntry
          returnKeyType="done"
          onSubmitEditing={handleLogin}
        />
        {fieldErrors.password ? (
          <Text style={styles.fieldErrorText}>{fieldErrors.password}</Text>
        ) : null}
      </View>

      <Pressable
        style={({ pressed }) => [
          styles.ctaButton,
          localLoginMutation.isPending && styles.ctaButtonDisabled,
          pressed && !localLoginMutation.isPending && styles.ctaButtonPressed,
        ]}
        onPress={handleLogin}
        disabled={localLoginMutation.isPending}
        accessibilityRole="button"
        accessibilityLabel="로그인"
      >
        <Text style={styles.ctaButtonText}>
          {localLoginMutation.isPending ? "로그인 중..." : "로그인"}
        </Text>
      </Pressable>

      {errorMessage ? (
        <Text style={styles.errorText}>{errorMessage}</Text>
      ) : null}
    </View>
  );
}

function SignupForm() {
  const router = useRouter();
  const sendCodeMutation = useSendEmailCodeMutation();
  const verifyCodeMutation = useVerifyEmailCodeMutation();
  const signupMutation = useEmailSignupMutation();

  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 이메일 인증 상태: idle → requested(타이머 진행) → verified
  const [verifyState, setVerifyState] = useState<
    "idle" | "requested" | "verified"
  >("idle");
  const [remainingSeconds, setRemainingSeconds] = useState(0);

  useEffect(() => {
    if (verifyState !== "requested") return;

    const timer = setInterval(() => {
      setRemainingSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [verifyState]);

  const isExpired = verifyState === "requested" && remainingSeconds <= 0;

  const handleRequestVerification = async () => {
    if (sendCodeMutation.isPending) return;

    const parsedEmail = emailSchema.safeParse(email);
    if (!parsedEmail.success) {
      setFieldErrors((prev) => ({
        ...prev,
        email: parsedEmail.error.issues[0].message,
      }));
      return;
    }

    setFieldErrors((prev) => ({ ...prev, email: undefined }));
    setErrorMessage(null);

    try {
      const result = await sendCodeMutation.mutateAsync({
        email: parsedEmail.data,
      });

      setVerificationCode("");
      setVerifyState("requested");
      setRemainingSeconds(
        (result.expiresInMinutes ?? VERIFICATION_TTL_SECONDS / 60) * 60,
      );
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(error) ??
          "인증번호 발송에 실패했어요. 다시 시도해주세요.",
      );
    }
  };

  const handleConfirmVerification = async () => {
    if (verifyCodeMutation.isPending) return;

    if (isExpired) {
      setErrorMessage("인증번호가 만료되었어요. 다시 요청해주세요.");
      return;
    }

    const parsedCode = codeSchema.safeParse(verificationCode);
    if (!parsedCode.success) {
      setErrorMessage(parsedCode.error.issues[0].message);
      return;
    }

    setErrorMessage(null);

    try {
      const result = await verifyCodeMutation.mutateAsync({
        email: email.trim(),
        code: parsedCode.data,
      });

      if (result.verified) {
        setVerifyState("verified");
      } else {
        setErrorMessage("인증번호가 일치하지 않아요.");
      }
    } catch (error) {
      // 만료/횟수 초과 등 서버 메시지를 그대로 노출
      setErrorMessage(
        getApiErrorMessage(error) ??
          "인증번호 확인에 실패했어요. 다시 시도해주세요.",
      );
    }
  };

  const handleSignup = async () => {
    if (signupMutation.isPending) return;

    setErrorMessage(null);

    const parsed = signupSchema.safeParse({
      email,
      password,
      passwordConfirm,
    });
    if (!parsed.success) {
      setFieldErrors(zodFieldErrors(parsed.error));
      return;
    }

    setFieldErrors({});

    if (verifyState !== "verified") {
      setErrorMessage("이메일 인증을 완료해주세요.");
      return;
    }

    try {
      const auth = await signupMutation.mutateAsync({
        email: parsed.data.email,
        password: parsed.data.password,
      });
      const needsOnboarding = auth.onboardingRequired || auth.isNewUser;

      if (needsOnboarding) {
        const hasPassedAgreements = await getAgreementStatus();

        if (hasPassedAgreements) {
          router.replace("/onboarding/permissions" as any);
        } else {
          router.replace("/onboarding/login?showTerms=1" as any);
        }
        return;
      }

      router.replace("/(tabs)" as any);
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(error) ?? "회원가입에 실패했어요. 다시 시도해주세요.",
      );
    }
  };

  return (
    <View>
      <Text style={styles.title}>이메일로 회원가입</Text>
      <Text style={styles.subtitle}>
        이메일과 비밀번호만 있으면 가입할 수 있어요.
      </Text>

      <View style={styles.fieldBox}>
        <Text style={styles.fieldLabel}>이메일</Text>
        <View style={styles.inlineRow}>
          <TextInput
            style={[styles.input, styles.flex]}
            value={email}
            onChangeText={setEmail}
            placeholder="이메일 입력"
            placeholderTextColor="#A6AFB6"
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            returnKeyType="next"
            editable={verifyState !== "verified"}
          />
          <Pressable
            style={({ pressed }) => [
              styles.inlineButton,
              (verifyState === "verified" || sendCodeMutation.isPending) &&
                styles.ctaButtonDisabled,
              pressed && verifyState !== "verified" &&
                styles.ctaButtonPressed,
            ]}
            onPress={handleRequestVerification}
            disabled={verifyState === "verified" || sendCodeMutation.isPending}
            accessibilityRole="button"
            accessibilityLabel="인증번호 요청"
          >
            <Text style={styles.inlineButtonText}>
              {sendCodeMutation.isPending
                ? "발송 중..."
                : verifyState === "idle"
                  ? "인증 요청"
                  : "재요청"}
            </Text>
          </Pressable>
        </View>
        {fieldErrors.email ? (
          <Text style={styles.fieldErrorText}>{fieldErrors.email}</Text>
        ) : null}
      </View>

      {verifyState !== "idle" ? (
        <View style={styles.fieldBox}>
          <Text style={styles.fieldLabel}>인증번호</Text>
          <View style={styles.inlineRow}>
            <View style={[styles.input, styles.flex, styles.codeInputBox]}>
              <TextInput
                style={styles.codeInput}
                value={verificationCode}
                onChangeText={setVerificationCode}
                placeholder="인증번호 입력"
                placeholderTextColor="#A6AFB6"
                keyboardType="number-pad"
                editable={verifyState === "requested" && !isExpired}
              />
              {verifyState === "requested" ? (
                <Text
                  style={[styles.timerText, isExpired && styles.timerExpired]}
                >
                  {formatRemaining(remainingSeconds)}
                </Text>
              ) : (
                <Ionicons name="checkmark-circle" size={22} color="#22C55E" />
              )}
            </View>
            <Pressable
              style={({ pressed }) => [
                styles.inlineButton,
                (verifyState === "verified" ||
                  isExpired ||
                  verifyCodeMutation.isPending) &&
                  styles.ctaButtonDisabled,
                pressed && verifyState === "requested" && !isExpired &&
                  styles.ctaButtonPressed,
              ]}
              onPress={handleConfirmVerification}
              disabled={
                verifyState === "verified" ||
                isExpired ||
                verifyCodeMutation.isPending
              }
              accessibilityRole="button"
              accessibilityLabel="인증번호 확인"
            >
              <Text style={styles.inlineButtonText}>
                {verifyState === "verified"
                  ? "인증 완료"
                  : verifyCodeMutation.isPending
                    ? "확인 중..."
                    : "확인"}
              </Text>
            </Pressable>
          </View>
          {isExpired ? (
            <Text style={styles.fieldErrorText}>
              인증번호가 만료되었어요. 다시 요청해주세요.
            </Text>
          ) : null}
        </View>
      ) : null}

      <View style={styles.fieldBox}>
        <Text style={styles.fieldLabel}>비밀번호</Text>
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          placeholder="비밀번호 입력"
          placeholderTextColor="#A6AFB6"
          autoCapitalize="none"
          autoCorrect={false}
          secureTextEntry
          returnKeyType="next"
        />
        {fieldErrors.password ? (
          <Text style={styles.fieldErrorText}>{fieldErrors.password}</Text>
        ) : null}
      </View>

      <View style={styles.fieldBox}>
        <Text style={styles.fieldLabel}>비밀번호 확인</Text>
        <TextInput
          style={styles.input}
          value={passwordConfirm}
          onChangeText={setPasswordConfirm}
          placeholder="비밀번호 재입력"
          placeholderTextColor="#A6AFB6"
          autoCapitalize="none"
          autoCorrect={false}
          secureTextEntry
          returnKeyType="done"
        />
        {fieldErrors.passwordConfirm ? (
          <Text style={styles.fieldErrorText}>
            {fieldErrors.passwordConfirm}
          </Text>
        ) : null}
      </View>

      <Pressable
        style={({ pressed }) => [
          styles.ctaButton,
          signupMutation.isPending && styles.ctaButtonDisabled,
          pressed && !signupMutation.isPending && styles.ctaButtonPressed,
        ]}
        onPress={handleSignup}
        disabled={signupMutation.isPending}
        accessibilityRole="button"
        accessibilityLabel="회원가입"
      >
        <Text style={styles.ctaButtonText}>
          {signupMutation.isPending ? "가입 중..." : "회원가입"}
        </Text>
      </Pressable>

      {errorMessage ? (
        <Text style={styles.errorText}>{errorMessage}</Text>
      ) : null}
    </View>
  );
}

function formatRemaining(seconds: number) {
  const clamped = Math.max(seconds, 0);
  const minutes = Math.floor(clamped / 60);
  const rest = clamped % 60;
  return `${minutes}:${String(rest).padStart(2, "0")}`;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  flex: {
    flex: 1,
  },
  header: {
    height: 48,
    justifyContent: "center",
    alignItems: "flex-start",
    paddingHorizontal: 12,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  segmentBox: {
    flexDirection: "row",
    gap: 4,
    padding: 4,
    borderRadius: 12,
    backgroundColor: "#F6F8F9",
    marginBottom: 32,
  },
  segment: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  segmentActive: {
    backgroundColor: "#FFFFFF",
  },
  segmentText: {
    fontSize: 16,
    fontWeight: "500",
    lineHeight: 24,
    color: "#A6AFB6",
  },
  segmentTextActive: {
    fontWeight: "600",
    color: "#111111",
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    color: "#111111",
    lineHeight: 30,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "500",
    color: "#636970",
    lineHeight: 23,
    marginBottom: 32,
  },
  fieldBox: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#636970",
    lineHeight: 24,
    marginBottom: 4,
  },
  input: {
    height: 52,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#E9ECED",
    backgroundColor: "#F8FAFB",
    paddingHorizontal: 20,
    fontSize: 18,
    fontWeight: "500",
    color: "#111111",
  },
  inlineRow: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  inlineButton: {
    height: 52,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: "#FF3E70",
    alignItems: "center",
    justifyContent: "center",
  },
  inlineButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  codeInputBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 0,
  },
  codeInput: {
    flex: 1,
    height: "100%",
    fontSize: 18,
    fontWeight: "500",
    color: "#111111",
  },
  timerText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FF3E70",
    fontVariant: ["tabular-nums"],
  },
  timerExpired: {
    color: "#DC2626",
  },
  fieldErrorText: {
    marginTop: 4,
    color: "#DC2626",
    fontSize: 13,
    fontWeight: "500",
  },
  ctaButton: {
    height: 54,
    borderRadius: 14,
    backgroundColor: "#FF3E70",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
  },
  ctaButtonPressed: {
    opacity: 0.85,
  },
  ctaButtonDisabled: {
    opacity: 0.6,
  },
  ctaButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  errorText: {
    marginTop: 12,
    color: "#DC2626",
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
  },
  // 하단 SNS 섹션
  snsSection: {
    marginTop: "auto",
    paddingTop: 48,
    alignItems: "center",
  },
  snsDividerRow: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "stretch",
    gap: 12,
    marginBottom: 24,
  },
  snsDividerLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#DEE3E5",
  },
  snsDividerText: {
    fontSize: 16,
    fontWeight: "500",
    lineHeight: 24,
    color: "#A6AFB6",
  },
  snsIconRow: {
    flexDirection: "row",
    gap: 22,
    alignItems: "center",
  },
  snsCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  snsCirclePressed: {
    opacity: 0.85,
  },
  snsCircleDisabled: {
    opacity: 0.6,
  },
  snsAppleCircle: {
    backgroundColor: "#000000",
  },
});
