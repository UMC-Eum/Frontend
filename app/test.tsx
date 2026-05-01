import { useRouter } from "expo-router";
import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// --- feature_basic-components 브랜치 컴포넌트 ---
import { Chip } from "../components/Chip";
import { ImageCard } from "../components/ImageCard";
import { ListItem } from "../components/ListItem";
import { Navbar } from "../components/Navbar";

// --- dev 브랜치 컴포넌트 ---
import DevBackHeader from "@/components/DevBackHeader";
import {
  Header1,
  Header2,
  Header3,
  Header4,
  Header5,
} from "@/components/header";
import ProgressBar from "@/components/progress-bar";
import TxtBox from "@/components/txt-box";

export default function TestPage() {
  const router = useRouter();

  // --- feature_basic-components 상태 ---
  const [activeTab, setActiveTab] = useState("home");
  const [isSwitchEnabled, setIsSwitchEnabled] = useState(true);
  const [selectedCards, setSelectedCards] = useState<number[]>([1]);

  // --- dev 상태 ---
  const [v1, setV1] = useState("");
  const [v2, setV2] = useState("");
  const [v3, setV3] = useState("텍스트");
  const [v4, setV4] = useState("텍스트");
  const [v5, setV5] = useState("텍스트");

  const toggleCard = (id: number) => {
    setSelectedCards((prev) =>
      prev.includes(id)
        ? prev.filter((cardId) => cardId !== id)
        : [...prev, id],
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <DevBackHeader title="컴포넌트 테스트" />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* ── Header ── */}
        <Text style={styles.sectionTitle}>Header</Text>
        <View style={styles.devSection}>
          <Header1 onPressBack={() => router.back()} hasAlarm />
          <Header2 title="Text" onPressBack={() => router.back()} />
          <Header3 title="Text" onPressBack={() => router.back()} />
          <Header4 title="Text" />
          <Header5 title="Text" rightText="Text 2" />
        </View>

        {/* ── 진행-bar ── */}
        <Text style={styles.sectionTitle}>진행-bar</Text>
        <View style={styles.devSection}>
          <ProgressBar value={1} max={5} />
          <ProgressBar value={2} max={5} />
          <ProgressBar value={3} max={5} />
          <ProgressBar value={4} max={5} />
          <ProgressBar value={5} max={5} />
        </View>

        {/* ── Txt-box ── */}
        <Text style={styles.sectionTitle}>Txt-box</Text>
        <View style={styles.devSection}>
          <TxtBox placeholder="텍스트" value={v1} onChangeText={setV1} />
          <TxtBox placeholder="텍스트" value={v2} onChangeText={setV2} />
          <TxtBox placeholder="텍스트" value={v3} onChangeText={setV3} />
          <TxtBox placeholder="텍스트" value={v4} onChangeText={setV4} />
          <TxtBox
            placeholder="텍스트"
            value={v5}
            onChangeText={setV5}
            supportingText="보조텍스트"
          />
        </View>

        {/* ── List ── */}
        <Text style={styles.sectionTitle}>List Component</Text>
        <View style={styles.featureSectionList}>
          <ListItem
            title="리스트 타이틀"
            subtitle="기타 텍스트"
            rightElementType="switch"
            isSwitchOn={isSwitchEnabled}
            onSwitchChange={setIsSwitchEnabled}
          />
          <ListItem
            title="리스트 타이틀"
            subtitle="기타 텍스트"
            rightElementType="text-chevron"
            rightText="TEXT"
            onPress={() => {}}
          />
          <ListItem
            title="리스트 타이틀"
            subtitle="기타 텍스트"
            rightElementType="chevron"
            onPress={() => {}}
          />
        </View>

        {/* ── Image Card ── */}
        <Text style={styles.sectionTitle}>Image Card Component</Text>
        <View style={[styles.featureSection, { flexDirection: "row", gap: 8 }]}>
          <ImageCard
            isSelected={selectedCards.includes(1)}
            onPress={() => toggleCard(1)}
          />
          <ImageCard
            isSelected={selectedCards.includes(2)}
            onPress={() => toggleCard(2)}
          />
        </View>

        {/* ── Navbar ── */}
        <Text style={styles.sectionTitle}>Navbar Component</Text>
        <View style={styles.featureSectionList}>
          <Navbar
            activeColor="#FC3367"
            tabs={[
              { id: "home", iconName: "home", label: "홈" },
              {
                id: "heart",
                iconName: "heart",
                label: "마음",
                hasDotBadge: true,
              },
              {
                id: "chat",
                iconName: "chat",
                label: "대화",
                badgeCount: 100,
              },
              { id: "profile", iconName: "person", label: "마이" },
            ]}
            activeTabId={activeTab}
            onTabPress={setActiveTab}
          />
        </View>

        {/* ── Chips ── */}
        <Text style={styles.sectionTitle}>Chips Component</Text>
        <View style={styles.featureSection}>
          <View style={styles.chipRow}>
            <Chip label="텍스트" variant="outline" />
            <Chip label="텍스트" variant="outlineActive" />
            <Chip label="텍스트" variant="solid" />
            <Chip label="텍스트" variant="outline" size="small" />
            <Chip label="텍스트" variant="outlineActive" size="small" />
            <Chip label="텍스트" variant="solid" size="small" />
          </View>
          <View style={[styles.chipRow, { marginTop: 16 }]}>
            <Chip label="텍스트" variant="outline" shape="rect" />
            <Chip label="텍스트" variant="outlineActive" shape="rect" />
            <Chip label="텍스트" variant="solid" shape="rect" />
            <Chip label="텍스트" variant="outline" shape="rect" size="small" />
            <Chip
              label="텍스트"
              variant="outlineActive"
              shape="rect"
              size="small"
            />
            <Chip label="텍스트" variant="solid" shape="rect" size="small" />
          </View>
          <View style={[styles.chipRow, { marginTop: 16 }]}>
            <Chip label="텍스트" variant="ghost" />
            <Chip label="텍스트" variant="ghost" size="small" />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  scrollContainer: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1A1A1A",
    marginTop: 28,
    marginBottom: 12,
  },
  // dev 브랜치의 섹션 스타일
  devSection: {
    gap: 14,
  },
  // feature 브랜치의 카드형 섹션 스타일
  featureSection: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  featureSectionList: {
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
});