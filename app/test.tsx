import React, { useState } from "react";
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import { Chip } from "../components/Chip";
import { ImageCard } from "../components/ImageCard";
import { ListItem } from "../components/ListItem";
import { Navbar } from "../components/Navbar";

export default function TestPage() {
  const [activeTab, setActiveTab] = useState("home");
  const [isSwitchEnabled, setIsSwitchEnabled] = useState(true);
  const [selectedCards, setSelectedCards] = useState<number[]>([1]);

  const toggleCard = (id: number) => {
    setSelectedCards((prev) =>
      prev.includes(id)
        ? prev.filter((cardId) => cardId !== id)
        : [...prev, id],
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.sectionTitle}>1. List Component</Text>
        <View style={styles.sectionList}>
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

        <Text style={styles.sectionTitle}>2. Image Card Component</Text>
        <View style={[styles.section, { flexDirection: "row" }]}>
          <ImageCard
            isSelected={selectedCards.includes(1)}
            onPress={() => toggleCard(1)}
          />
          <ImageCard
            isSelected={selectedCards.includes(2)}
            onPress={() => toggleCard(2)}
          />
        </View>

        <Text style={styles.sectionTitle}>3. Navbar Component</Text>
        <View style={styles.sectionList}>
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

        <Text style={styles.sectionTitle}>4. Chips Component</Text>
        <View style={styles.section}>
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

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  container: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    marginTop: 24,
    color: "#333",
  },
  section: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionList: {
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
