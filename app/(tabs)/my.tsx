import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const ACCENT = "#FC3367";
const TEXT = "#202020";
const SUB_TEXT = "#636970";
const MUTED = "#A6AFB6";
const PROFILE_IMAGE =
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=240&h=240&fit=crop&crop=faces";

export default function MyTabScreen() {
  const [notificationEnabled, setNotificationEnabled] = useState(true);

  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        alwaysBounceVertical
        bounces
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.content}
      >
        <Text style={styles.screenTitle}>마이페이지</Text>

        <View style={[styles.card, styles.profileCard]}>
          <View style={styles.profileTop}>
            <View style={styles.avatar}>
              <View style={styles.avatarImageClip}>
                <Image
                  source={{ uri: PROFILE_IMAGE }}
                  style={styles.avatarImage}
                  resizeMode="cover"
                />
              </View>
              <View style={styles.editBadge}>
                <Ionicons
                  name="pencil"
                  size={15}
                  color="#6D747B"
                />
              </View>
            </View>

            <View style={styles.profileInfo}>
              <View style={styles.nameRow}>
                <Text style={styles.name}>루시</Text>
                <Text style={styles.age}> · 54세</Text>
                <View style={styles.verifiedBadge}>
                  <Ionicons name="checkmark" size={13} color="#FFFFFF" />
                </View>
              </View>

              <View style={styles.locationRow}>
                <Ionicons name="location-sharp" size={21} color="#687076" />
                <Text style={styles.location}>서울시 광진구</Text>
                <TouchableOpacity activeOpacity={0.7}>
                  <Text style={styles.editText}>수정</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <View style={styles.bioBox}>
            <Text style={styles.bioLabel}>나의 소개</Text>
            <Text style={styles.bioText} numberOfLines={2}>
              안녕하세요 등산이 취미인 사람입니다. 같이 즐겁게 등산하실분
              구해요~ 등산 경험 여러 있습니다. 😄 편하게 연...
            </Text>
          </View>

          <TouchableOpacity style={styles.profileEditButton} activeOpacity={0.7}>
            <Text style={styles.profileEditText}>프로필 수정</Text>
            <Ionicons name="chevron-forward" size={18} color={ACCENT} />
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>매칭 현황</Text>
          <View style={styles.matchPanel}>
            <View style={styles.matchItem}>
              <Text style={styles.matchNumber}>3</Text>
              <Text style={styles.matchLabel}>현재 매칭</Text>
            </View>
            <View style={styles.matchDivider} />
            <View style={styles.matchItem}>
              <Text style={styles.matchNumber}>12</Text>
              <Text style={styles.matchLabel}>받은 마음</Text>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>이상형 설정</Text>

          <TouchableOpacity
            style={[styles.settingRow, styles.voiceSettingRow]}
            activeOpacity={0.7}
          >
            <View style={[styles.settingIcon, styles.voiceIcon]}>
              <Ionicons name="mic" size={24} color="#FFFFFF" />
            </View>
            <View style={styles.settingTextBlock}>
              <Text style={styles.settingTitle}>음성으로 말하기</Text>
              <Text style={[styles.settingSubtitle, styles.voiceSubtitle]}>
                현재 녹음된 이상형 있음
              </Text>
            </View>
            <Text style={styles.reRecordText}>재녹음</Text>
            <Ionicons name="chevron-forward" size={20} color={ACCENT} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingRow} activeOpacity={0.7}>
            <View style={styles.settingIcon}>
              <Ionicons name="pencil" size={24} color={MUTED} />
            </View>
            <View style={styles.settingTextBlock}>
              <Text style={styles.settingTitle}>조건 선택</Text>
              <Text style={styles.settingSubtitle}>취미, 스타일 등 설정</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={MUTED} />
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>내 동호회</Text>

          <ClubRow
            title="한강 러닝 모임🔥"
            subtitle="멤버 24명"
            variant="running"
          />
          <ClubRow
            title="등산을 좋아하는 동호회"
            subtitle="멤버 10명"
            variant="mountain"
          />

          <TouchableOpacity style={styles.viewAllButton} activeOpacity={0.75}>
            <Text style={styles.viewAllText}>전체 보기</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <View style={styles.notificationRow}>
            <Text style={styles.notificationText}>알림 설정</Text>
            <Switch
              value={notificationEnabled}
              onValueChange={setNotificationEnabled}
              trackColor={{ false: "#E5E7EB", true: ACCENT }}
              thumbColor="#FFFFFF"
              ios_backgroundColor="#E5E7EB"
            />
          </View>
          <View style={styles.thinDivider} />
          <TouchableOpacity activeOpacity={0.7}>
            <Text style={styles.logoutText}>로그아웃</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.withdrawCard} activeOpacity={0.7}>
          <Text style={styles.withdrawText}>탈퇴하기</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function ClubRow({
  title,
  subtitle,
  variant,
}: {
  title: string;
  subtitle: string;
  variant: "running" | "mountain";
}) {
  return (
    <View style={styles.clubRow}>
      <View
        style={[
          styles.clubThumb,
          variant === "running" ? styles.runningThumb : styles.mountainThumb,
        ]}
      >
        {variant === "running" ? (
          <>
            <Ionicons name="walk" size={16} color="#5E321E" />
            <View style={styles.runnerDot} />
          </>
        ) : (
          <>
            <View style={styles.mountainSky} />
            <View style={styles.mountainShape} />
            <View style={styles.mountainGround} />
          </>
        )}
      </View>
      <View style={styles.clubTextBlock}>
        <Text style={styles.clubTitle}>{title}</Text>
        <Text style={styles.clubSubtitle}>{subtitle}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F6F7F8",
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 36,
  },
  screenTitle: {
    marginBottom: 27,
    color: TEXT,
    fontSize: 25,
    fontWeight: "800",
    lineHeight: 32,
  },
  card: {
    marginBottom: 12,
    padding: 16,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.08,
    shadowRadius: 13,
    elevation: 4,
  },
  profileCard: {
    paddingBottom: 14,
  },
  profileTop: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  avatar: {
    width: 82,
    height: 82,
    marginRight: 18,
    overflow: "visible",
  },
  avatarImageClip: {
    width: "100%",
    height: "100%",
    overflow: "hidden",
    borderRadius: 41,
    backgroundColor: "#DCE7EC",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  editBadge: {
    position: "absolute",
    right: -1,
    bottom: 3,
    width: 29,
    height: 29,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 15,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 6,
  },
  profileInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  name: {
    color: TEXT,
    fontSize: 25,
    fontWeight: "800",
    lineHeight: 31,
  },
  age: {
    color: "#636970",
    fontSize: 22,
    fontWeight: "500",
    lineHeight: 30,
  },
  verifiedBadge: {
    width: 18,
    height: 18,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 6,
    borderRadius: 9,
    backgroundColor: ACCENT,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  location: {
    marginLeft: 3,
    marginRight: 8,
    color: SUB_TEXT,
    fontSize: 12,
    fontWeight: "500",
  },
  editText: {
    color: ACCENT,
    fontSize: 12,
    fontWeight: "600",
    textDecorationLine: "underline",
  },
  bioBox: {
    minHeight: 84,
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#DEE3E5",
    borderRadius: 6,
    backgroundColor: "#F9FAFB",
  },
  bioLabel: {
    marginBottom: 5,
    color: MUTED,
    fontSize: 13,
    fontWeight: "500",
  },
  bioText: {
    color: SUB_TEXT,
    fontSize: 13,
    fontWeight: "500",
    lineHeight: 21,
  },
  profileEditButton: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginTop: 9,
  },
  profileEditText: {
    color: ACCENT,
    fontSize: 13,
    fontWeight: "700",
  },
  sectionTitle: {
    marginBottom: 14,
    color: TEXT,
    fontSize: 18,
    fontWeight: "800",
    lineHeight: 24,
  },
  matchPanel: {
    minHeight: 58,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 8,
    backgroundColor: "#FAFBFC",
  },
  matchItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  matchNumber: {
    color: ACCENT,
    fontSize: 24,
    fontWeight: "800",
    lineHeight: 29,
  },
  matchLabel: {
    color: SUB_TEXT,
    fontSize: 12,
    fontWeight: "500",
  },
  matchDivider: {
    width: 1,
    height: 46,
    backgroundColor: "#E8ECEF",
  },
  settingRow: {
    minHeight: 55,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#DEE3E5",
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
  },
  voiceSettingRow: {
    marginBottom: 10,
    borderColor: "#FF7698",
    backgroundColor: "#FFF0F4",
  },
  settingIcon: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    borderRadius: 17,
    backgroundColor: "#F2F4F5",
  },
  voiceIcon: {
    backgroundColor: ACCENT,
  },
  settingTextBlock: {
    flex: 1,
  },
  settingTitle: {
    color: TEXT,
    fontSize: 14,
    fontWeight: "700",
  },
  settingSubtitle: {
    marginTop: 2,
    color: SUB_TEXT,
    fontSize: 11,
    fontWeight: "500",
  },
  voiceSubtitle: {
    color: ACCENT,
  },
  reRecordText: {
    marginRight: 3,
    color: ACCENT,
    fontSize: 15,
    fontWeight: "700",
  },
  clubRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  clubThumb: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    overflow: "hidden",
    borderRadius: 6,
  },
  runningThumb: {
    backgroundColor: "#EFD7BA",
  },
  runnerDot: {
    position: "absolute",
    right: 9,
    top: 11,
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#361A10",
  },
  mountainThumb: {
    backgroundColor: "#B9DEE0",
  },
  mountainSky: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 18,
    backgroundColor: "#BBDDE0",
  },
  mountainShape: {
    position: "absolute",
    bottom: 9,
    left: 3,
    width: 34,
    height: 16,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    backgroundColor: "#7AA183",
  },
  mountainGround: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 10,
    backgroundColor: "#D9CEB6",
  },
  clubTextBlock: {
    flex: 1,
  },
  clubTitle: {
    color: TEXT,
    fontSize: 13,
    fontWeight: "800",
    lineHeight: 18,
  },
  clubSubtitle: {
    color: SUB_TEXT,
    fontSize: 13,
    fontWeight: "500",
    lineHeight: 18,
  },
  viewAllButton: {
    height: 34,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 6,
    borderRadius: 6,
    backgroundColor: "#DDE2E5",
  },
  viewAllText: {
    color: "#636970",
    fontSize: 14,
    fontWeight: "800",
  },
  notificationRow: {
    height: 36,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  notificationText: {
    color: TEXT,
    fontSize: 16,
    fontWeight: "500",
  },
  thinDivider: {
    height: 1,
    marginVertical: 15,
    backgroundColor: "#EEF0F2",
  },
  logoutText: {
    color: ACCENT,
    fontSize: 15,
    fontWeight: "500",
  },
  withdrawCard: {
    height: 52,
    justifyContent: "center",
    marginBottom: 2,
    paddingHorizontal: 20,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.08,
    shadowRadius: 13,
    elevation: 4,
  },
  withdrawText: {
    color: MUTED,
    fontSize: 15,
    fontWeight: "600",
  },
});
