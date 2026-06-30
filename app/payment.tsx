import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Cta from "@/components/Cta";
import {
  PAYMENT_COLORS,
  PaymentBenefitList,
  PaymentCompleteSummary,
  PaymentMethodIntro,
  PaymentPlanCard,
} from "@/components/payment/PaymentParts";

type PaymentStep = "overview" | "method" | "complete";

export default function PaymentScreen() {
  const router = useRouter();
  const [step, setStep] = useState<PaymentStep>("overview");

  const handleBack = () => {
    if (step === "complete") {
      setStep("method");
      return;
    }

    if (step === "method") {
      setStep("overview");
      return;
    }

    router.back();
  };

  const handleCtaPress = () => {
    if (step === "overview") {
      setStep("method");
      return;
    }

    if (step === "method") {
      setStep("complete");
      return;
    }

    router.replace("/(tabs)" as never);
  };

  const ctaLabel =
    step === "overview"
      ? "9,900원 결제하고 시작하기"
      : step === "method"
        ? "결제하기"
        : "이음 시작하기";

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <PaymentHeader onBack={handleBack} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {step === "overview" ? (
          <View style={styles.overviewContent}>
            <PaymentPlanCard />
            <PaymentBenefitList />
          </View>
        ) : null}

        {step === "method" ? (
          <View style={styles.methodContent}>
            <PaymentMethodIntro />
          </View>
        ) : null}

        {step === "complete" ? <PaymentCompleteSummary /> : null}
      </ScrollView>

      <Cta
        label={ctaLabel}
        onPress={handleCtaPress}
        containerStyle={styles.ctaContainer}
        buttonStyle={styles.ctaButton}
        labelStyle={styles.ctaLabel}
      />
    </SafeAreaView>
  );
}

function PaymentHeader({ onBack }: { onBack: () => void }) {
  return (
    <View style={styles.header}>
      <Pressable style={styles.headerButton} onPress={onBack} hitSlop={10}>
        <Ionicons name="chevron-back" size={24} color={PAYMENT_COLORS.gray500} />
      </Pressable>
      <Text style={styles.headerTitle}>구독 결제</Text>
      <View style={styles.headerButton} />
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: PAYMENT_COLORS.white,
  },
  header: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: PAYMENT_COLORS.white,
  },
  headerButton: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    color: PAYMENT_COLORS.black,
    fontSize: 24,
    lineHeight: 30,
    fontWeight: "600",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 32,
  },
  overviewContent: {
    gap: 32,
  },
  methodContent: {
    gap: 4,
  },
  ctaContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  ctaButton: {
    height: 54,
    borderRadius: 14,
    backgroundColor: PAYMENT_COLORS.pink,
  },
  ctaLabel: {
    fontSize: 18,
    lineHeight: 23,
    fontWeight: "600",
  },
});
