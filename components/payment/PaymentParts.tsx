import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Path, SvgProps } from "react-native-svg";

import { Chip } from "@/components/Chip";

export const PAYMENT_COLORS = {
  pink: "#FF3E70",
  pink100: "#FFE3E7",
  pink300: "#FFA0B4",
  black: "#202020",
  gray700: "#636970",
  gray500: "#A6AFB6",
  gray300: "#DEE3E5",
  gray150: "#E9ECED",
  white: "#FFFFFF",
};

type Benefit = {
  title: string;
  description: string;
  icon: "heart" | "ai" | "search";
};

const BENEFITS: Benefit[] = [
  {
    title: "무제한 호감 보내기",
    description: "제한 없이 마음을 표현할 수 있어요.",
    icon: "heart",
  },
  {
    title: "나를 좋아한 사람 모두 보기",
    description: "제한 없이 마음을 표현할 수 있어요.",
    icon: "ai",
  },
  {
    title: "프로필 우선 노출",
    description: "더 많은 인연에게 소개됩니다.",
    icon: "search",
  },
];

export function PaymentPlanCard() {
  return (
    <View style={styles.card}>
      <View style={styles.planTop}>
        <View style={styles.chipRow}>
          <Chip
            label="프리미엄 멤버십"
            variant="solid"
            size="small"
            style={styles.figmaChip}
            textStyle={styles.selectedChipText}
          />
          <Chip
            label="17% 할인"
            variant="outlineActive"
            size="small"
            style={styles.discountChip}
            textStyle={styles.discountChipText}
          />
        </View>
        <View style={styles.planTextGroup}>
          <Text style={styles.planTitle}>이음 프리미엄</Text>
          <Text style={styles.planDescription}>월 정기 구독, 매월 자동 결제</Text>
        </View>
      </View>
      <View style={styles.divider} />
      <View style={styles.priceRow}>
        <View style={styles.priceGroup}>
          <Text style={styles.price}>9,900</Text>
          <Text style={styles.priceUnit}>월 / 원</Text>
        </View>
        <Text style={styles.originalPrice}>12,000원</Text>
      </View>
    </View>
  );
}

export function PaymentBenefitList() {
  return (
    <View style={styles.benefitList}>
      {BENEFITS.map((benefit) => (
        <BenefitCard key={benefit.title} benefit={benefit} />
      ))}
    </View>
  );
}

export function PaymentMethodIntro() {
  return (
    <View style={styles.methodIntro}>
      <Text style={styles.methodTitle}>결제수단 선택</Text>
      <Text style={styles.methodDescription}>편한 방법으로 결제해주세요.</Text>
    </View>
  );
}

export function PaymentCompleteSummary() {
  return (
    <View style={styles.completeWrap}>
      <View style={styles.completeHero}>
        <CompleteIcon width={92} height={92} />
        <View style={styles.completeTextGroup}>
          <Text style={styles.completeTitle}>구독을 완료했어요!🎉</Text>
          <Text style={styles.completeDescription}>더 많은 인연을 즐기러 가볼까요?</Text>
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.historyTop}>
          <Chip
            label="결제내역"
            variant="outline"
            size="small"
            style={styles.figmaChip}
            textStyle={styles.historyChipText}
          />
          <View style={styles.historyPlanRow}>
            <Text style={styles.planTitle}>이음 프리미엄</Text>
            <Text style={styles.historyPrice}>9,900</Text>
          </View>
        </View>
        <View style={styles.divider} />
        <View style={styles.historyDetails}>
          <HistoryRow label="결제수단" value="카카오페이" />
          <HistoryRow label="결제일시" value="2026.05.10  21:09" />
          <HistoryRow label="다음 결제일" value="2026.06.10" />
        </View>
      </View>
    </View>
  );
}

function BenefitCard({ benefit }: { benefit: Benefit }) {
  return (
    <View style={styles.benefitCard}>
      <View style={styles.iconBox}>
        <BenefitIcon kind={benefit.icon} />
      </View>
      <View style={styles.benefitTextGroup}>
        <Text style={styles.benefitTitle}>{benefit.title}</Text>
        <Text style={styles.benefitDescription}>{benefit.description}</Text>
      </View>
    </View>
  );
}

function HistoryRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.historyRow}>
      <Text style={styles.historyLabel}>{label}</Text>
      <Text style={styles.historyValue}>{value}</Text>
    </View>
  );
}

function BenefitIcon({ kind }: { kind: Benefit["icon"] }) {
  if (kind === "heart") {
    return (
      <Svg
        width={28}
        height={28}
        viewBox="0 0 24.0003 23.3333"
        fill="none"
        preserveAspectRatio="none"
      >
        <Path
          d="M17.2227 2.16602C20.7379 2.16607 23.5 5.07781 23.5 8.6748C23.5 10.3658 22.8926 11.8014 21.9053 13.168C20.9276 14.5211 19.5576 15.8325 18.0078 17.2734L18.0049 17.2773L13.8496 21.0908C13.6533 21.271 13.4847 21.4255 13.3359 21.542C13.1762 21.667 13.0072 21.7739 12.8047 21.8359C12.4977 21.9299 12.1693 21.9299 11.8623 21.8359C11.6601 21.7739 11.4916 21.6669 11.332 21.542C11.1832 21.4255 11.0137 21.2711 10.8174 21.0908L6.66309 17.2773L6.65918 17.2734C5.10946 15.8326 3.73935 14.5211 2.76172 13.168C1.77447 11.8014 1.16701 10.3658 1.16699 8.6748C1.16699 5.07792 3.92925 2.16626 7.44434 2.16602C9.23474 2.16602 10.8323 2.92334 11.9678 4.1416C12.0623 4.24308 12.1953 4.30078 12.334 4.30078C12.4725 4.30069 12.6047 4.2429 12.6992 4.1416C13.8347 2.92333 15.4323 2.16602 17.2227 2.16602Z"
          fill={PAYMENT_COLORS.pink}
          stroke="#FF6B8E"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M4.4258 7.59981C4.4258 7.59981 4.4258 6.8785 5.17458 6.1736C5.80202 5.58293 6.67458 5.6736 6.67458 5.6736"
          stroke="#FFF0F2"
          strokeWidth={2}
          strokeLinecap="round"
        />
        <Circle cx="4.66699" cy="10.666" r="1" fill="#FFF0F2" />
      </Svg>
    );
  }

  if (kind === "ai") {
    return (
      <Svg width={21} height={21} viewBox="0 0 21 21" fill="none">
        <Path
          d="M16.6861 12.9575C16.9493 12.2468 17.9541 12.2468 18.2173 12.9575L18.687 14.2261C18.7698 14.4495 18.946 14.6258 19.1695 14.7085L20.438 15.1772C21.1487 15.4404 21.1485 16.4462 20.438 16.7095L19.1695 17.1792C18.9459 17.2619 18.7697 17.4381 18.687 17.6616L18.2173 18.9292C17.9542 19.6402 16.9492 19.6402 16.6861 18.9292L16.2163 17.6616C16.1336 17.4381 15.9574 17.2619 15.7339 17.1792L14.4654 16.7095C13.7547 16.4462 13.7546 15.4404 14.4654 15.1772L15.7339 14.7085C15.9574 14.6258 16.1336 14.4495 16.2163 14.2261L16.6861 12.9575ZM7.2925 1.79541C7.74366 0.576781 9.46749 0.576625 9.91848 1.79541L11.1128 5.02393C11.2546 5.40714 11.5568 5.70928 11.94 5.85108L15.1685 7.04541C16.3873 7.4964 16.3871 9.22023 15.1685 9.67139L11.94 10.8667C11.5568 11.0085 11.2546 11.3106 11.1128 11.6939L9.91848 14.9224C9.46743 16.141 7.74373 16.1408 7.2925 14.9224L6.09719 11.6939C5.95539 11.3106 5.65325 11.0085 5.27004 10.8667L2.04152 9.67139C0.82308 9.22017 0.822908 7.49646 2.04152 7.04541L5.27004 5.85108C5.65324 5.70928 5.95539 5.40713 6.09719 5.02393L7.2925 1.79541Z"
          fill={PAYMENT_COLORS.pink}
        />
      </Svg>
    );
  }

  return (
    <Svg width={28} height={28} viewBox="0 0 28 28" fill="none">
      <Circle cx="12.7036" cy="12.7033" r="9.2037" stroke={PAYMENT_COLORS.pink} strokeWidth={2.33333} />
      <Path
        d="M19.2535 19.0533L23.0737 22.8735"
        stroke={PAYMENT_COLORS.pink}
        strokeWidth={2.33333}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M15.8474 10.4103C15.8474 12.1647 14.4252 13.5869 12.6708 13.5869C10.9164 13.5869 9.49424 12.1647 9.49424 10.4103C9.49424 8.65592 10.9164 7.23371 12.6708 7.23371C14.4252 7.23371 15.8474 8.65592 15.8474 10.4103Z"
        fill={PAYMENT_COLORS.pink}
      />
      <Path
        d="M17.8198 20.9627C18.8134 20.9627 19.6451 20.1308 19.3195 19.1861C19.2536 18.9951 19.1771 18.8067 19.09 18.6216C18.7408 17.8794 18.229 17.205 17.5838 16.6369C16.9386 16.0688 16.1727 15.6182 15.3297 15.3107C14.4867 15.0033 13.5832 14.845 12.6708 14.845C11.7583 14.845 10.8548 15.0033 10.0118 15.3107C9.16883 15.6182 8.40288 16.0688 7.75768 16.6369C7.11249 17.205 6.60069 17.8794 6.25152 18.6216C6.16444 18.8067 6.0879 18.9951 6.02206 19.1861C5.69646 20.1308 6.52812 20.9627 7.52174 20.9627H12.6708H17.8198Z"
        fill={PAYMENT_COLORS.pink}
      />
    </Svg>
  );
}

function CompleteIcon(props: SvgProps) {
  return (
    <Svg viewBox="0 0 94 94" fill="none" {...props}>
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M93 47C93 72.4038 72.4038 93 47 93C21.5962 93 1 72.4038 1 47C1 21.5962 21.5962 1 47 1C72.4038 1 93 21.5962 93 47Z"
        fill="#FC3367"
      />
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M68.9401 33.5174C70.5856 35.1629 70.5856 37.8307 68.9401 39.4762L45.412 63.0044C44.6218 63.7946 43.5501 64.2385 42.4326 64.2385C41.3151 64.2385 40.2434 63.7946 39.4532 63.0044L25.0599 48.6111C23.4144 46.9656 23.4144 44.2978 25.0599 42.6523C26.7053 41.0068 29.3732 41.0068 31.0187 42.6523L42.4326 54.0662L62.9814 33.5174C64.6268 31.872 67.2947 31.872 68.9401 33.5174Z"
        fill={PAYMENT_COLORS.white}
      />
      <Path
        d="M68.9401 39.4762L68.233 38.7691V38.7691L68.9401 39.4762ZM68.9401 33.5174L69.6472 32.8103V32.8103L68.9401 33.5174ZM45.412 63.0044L44.7049 62.2973V62.2973L45.412 63.0044ZM25.0599 48.6111L24.3528 49.3182V49.3182L25.0599 48.6111ZM25.0599 42.6523L25.767 43.3594V43.3594L25.0599 42.6523ZM31.0187 42.6523L31.7258 41.9452V41.9452L31.0187 42.6523ZM42.4326 54.0662L41.7255 54.7733C41.913 54.9609 42.1674 55.0662 42.4326 55.0662C42.6978 55.0662 42.9521 54.9609 43.1397 54.7733L42.4326 54.0662ZM62.9813 33.5174L62.2742 32.8103V32.8103L62.9813 33.5174ZM93 47H92C92 71.8516 71.8516 92 47 92V93V94C72.9561 94 94 72.9561 94 47H93ZM47 93V92C22.1484 92 2 71.8516 2 47H1H0C0 72.9561 21.0439 94 47 94V93ZM1 47H2C2 22.1484 22.1484 2 47 2V1V0C21.0439 0 0 21.0439 0 47H1ZM47 1V2C71.8516 2 92 22.1484 92 47H93H94C94 21.0439 72.9561 0 47 0V1ZM68.9401 39.4762L69.6472 40.1833C71.6832 38.1473 71.6832 34.8463 69.6472 32.8103L68.9401 33.5174L68.233 34.2245C69.488 35.4795 69.488 37.5142 68.233 38.7691L68.9401 39.4762ZM45.412 63.0044L46.1191 63.7115L69.6472 40.1833L68.9401 39.4762L68.233 38.7691L44.7049 62.2973L45.412 63.0044ZM42.4326 64.2385V65.2385C43.8153 65.2385 45.1413 64.6892 46.1191 63.7115L45.412 63.0044L44.7049 62.2973C44.1022 62.8999 43.2848 63.2385 42.4326 63.2385V64.2385ZM39.4532 63.0044L38.7461 63.7115C39.7238 64.6892 41.0499 65.2385 42.4326 65.2385V64.2385V63.2385C41.5803 63.2385 40.7629 62.8999 40.1603 62.2973L39.4532 63.0044ZM25.0599 48.6111L24.3528 49.3182L38.7461 63.7115L39.4532 63.0044L40.1603 62.2973L25.767 47.904L25.0599 48.6111ZM25.0599 42.6523L24.3528 41.9452C22.3168 43.9812 22.3168 47.2822 24.3528 49.3182L25.0599 48.6111L25.767 47.904C24.512 46.649 24.512 44.6143 25.767 43.3594L25.0599 42.6523ZM31.0187 42.6523L31.7258 41.9452C29.6898 39.9092 26.3888 39.9092 24.3528 41.9452L25.0599 42.6523L25.767 43.3594C27.0219 42.1044 29.0566 42.1044 30.3115 43.3594L31.0187 42.6523ZM42.4326 54.0662L43.1397 53.3591L31.7258 41.9452L31.0187 42.6523L30.3115 43.3594L41.7255 54.7733L42.4326 54.0662ZM62.9813 33.5174L62.2742 32.8103L41.7255 53.3591L42.4326 54.0662L43.1397 54.7733L63.6885 34.2245L62.9813 33.5174ZM68.9401 33.5174L69.6472 32.8103C67.6113 30.7743 64.3102 30.7743 62.2742 32.8103L62.9813 33.5174L63.6885 34.2245C64.9434 32.9696 66.9781 32.9696 68.233 34.2245L68.9401 33.5174Z"
        fill={PAYMENT_COLORS.pink}
      />
    </Svg>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "100%",
    padding: 12,
    borderWidth: 1,
    borderColor: PAYMENT_COLORS.gray300,
    borderRadius: 10,
    backgroundColor: PAYMENT_COLORS.white,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  planTop: {
    gap: 12,
    paddingVertical: 8,
  },
  chipRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  figmaChip: {
    height: 24,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  discountChip: {
    height: 24,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 0,
    backgroundColor: PAYMENT_COLORS.pink100,
  },
  selectedChipText: {
    fontSize: 12,
    lineHeight: 20,
    fontWeight: "500",
  },
  discountChipText: {
    color: PAYMENT_COLORS.pink,
    fontSize: 12,
    lineHeight: 20,
    fontWeight: "500",
  },
  historyChipText: {
    color: PAYMENT_COLORS.gray700,
    fontSize: 12,
    lineHeight: 20,
    fontWeight: "500",
  },
  planTextGroup: {
    gap: 4,
  },
  planTitle: {
    color: PAYMENT_COLORS.black,
    fontSize: 20,
    lineHeight: 25,
    fontWeight: "600",
  },
  planDescription: {
    color: PAYMENT_COLORS.gray500,
    fontSize: 18,
    lineHeight: 23,
    fontWeight: "500",
  },
  divider: {
    height: 1,
    backgroundColor: PAYMENT_COLORS.gray150,
  },
  priceRow: {
    paddingTop: 16,
    paddingBottom: 12,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  priceGroup: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
  },
  price: {
    color: "#000000",
    fontSize: 36,
    lineHeight: 46,
    fontWeight: "700",
  },
  priceUnit: {
    paddingBottom: 6,
    color: PAYMENT_COLORS.gray700,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "500",
  },
  originalPrice: {
    paddingBottom: 6,
    color: PAYMENT_COLORS.gray500,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "500",
    textDecorationLine: "line-through",
  },
  benefitList: {
    gap: 12,
  },
  benefitCard: {
    width: "100%",
    minHeight: 58,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderColor: PAYMENT_COLORS.gray300,
    borderRadius: 10,
    backgroundColor: PAYMENT_COLORS.white,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  iconBox: {
    width: 52,
    height: 52,
    padding: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: PAYMENT_COLORS.pink300,
    borderRadius: 12,
    backgroundColor: PAYMENT_COLORS.pink100,
  },
  benefitTextGroup: {
    flex: 1,
    gap: 4,
  },
  benefitTitle: {
    color: PAYMENT_COLORS.black,
    fontSize: 18,
    lineHeight: 23,
    fontWeight: "600",
  },
  benefitDescription: {
    color: PAYMENT_COLORS.gray700,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "500",
  },
  methodIntro: {
    gap: 4,
  },
  methodTitle: {
    color: PAYMENT_COLORS.black,
    fontSize: 28,
    lineHeight: 36,
    fontWeight: "600",
  },
  methodDescription: {
    color: PAYMENT_COLORS.gray700,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "500",
  },
  completeWrap: {
    gap: 32,
  },
  completeHero: {
    height: 174,
    paddingHorizontal: 10,
    alignItems: "center",
    gap: 24,
  },
  completeIcon: {
    width: 92,
    height: 92,
  },
  completeTextGroup: {
    alignItems: "center",
    gap: 4,
  },
  completeTitle: {
    color: PAYMENT_COLORS.black,
    fontSize: 24,
    lineHeight: 30,
    fontWeight: "600",
    textAlign: "center",
  },
  completeDescription: {
    color: PAYMENT_COLORS.gray500,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "500",
    textAlign: "center",
  },
  historyTop: {
    gap: 12,
    paddingTop: 8,
  },
  historyPlanRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  historyPrice: {
    color: PAYMENT_COLORS.black,
    fontSize: 20,
    lineHeight: 25,
    fontWeight: "600",
  },
  historyDetails: {
    gap: 10,
    paddingTop: 16,
    paddingBottom: 12,
  },
  historyRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
  },
  historyLabel: {
    color: PAYMENT_COLORS.gray700,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "500",
  },
  historyValue: {
    color: PAYMENT_COLORS.gray500,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "500",
    textAlign: "right",
  },
});
