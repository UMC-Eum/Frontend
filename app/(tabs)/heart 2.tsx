import DevBackHeader from "@/components/DevBackHeader";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 32 - 16) / 2;

// 초기 더미 데이터를 생성하는 함수
const generateDummyData = (startIndex: number, count: number) => {
  return Array.from({ length: count }).map((_, i) => ({
    id: (startIndex + i).toString(),
    name: "김성수",
    age: 64,
    location: "죽전",
    image: `https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=400&auto=format&fit=crop&sig=${startIndex + i}`, // 이미지 캐싱 방지용 sig 추가
    isLiked: true,
  }));
};

export default function HeartScreen() {
  const [activeTab, setActiveTab] = useState<"sent" | "received">("sent");

  // ✨ 무한 스크롤을 위한 상태 관리
  const [data, setData] = useState(generateDummyData(0, 10)); // 처음에 10개 로드
  const [isLoading, setIsLoading] = useState(false); // 로딩 상태

  // ✨ 스크롤이 바닥에 닿았을 때 실행되는 함수
  const loadMoreData = () => {
    if (isLoading) return; // 이미 불러오는 중이면 중복 실행 방지

    setIsLoading(true);
    console.log("새로운 데이터 불러오는 중... 🔄");

    // 실제 환경의 API 호출을 흉내 내기 위해 1초(1000ms) 딜레이를 줍니다.
    setTimeout(() => {
      const newData = generateDummyData(data.length, 10); // 기존 개수 이후부터 10개 새로 생성
      setData((prev) => [...prev, ...newData]); // 기존 데이터에 새 데이터 이어붙이기
      setIsLoading(false);
    }, 1000);
  };

  const renderTopTabs = () => (
    <View style={styles.topTabs}>
      <Pressable style={styles.tabButton} onPress={() => setActiveTab("sent")}>
        <Text
          style={[styles.tabText, activeTab === "sent" && styles.activeTabText]}
        >
          내가 누른
        </Text>
        {activeTab === "sent" && <View style={styles.activeIndicator} />}
      </Pressable>
      <Pressable
        style={styles.tabButton}
        onPress={() => setActiveTab("received")}
      >
        <Text
          style={[
            styles.tabText,
            activeTab === "received" && styles.activeTabText,
          ]}
        >
          나를 마음한
        </Text>
        {activeTab === "received" && <View style={styles.activeIndicator} />}
      </Pressable>
    </View>
  );

  const renderCard = ({ item }: { item: any }) => (
    <ImageBackground
      source={{ uri: item.image }}
      style={styles.card}
      imageStyle={styles.cardImage}
    >
      <View style={styles.cardDarkOverlay} />
      <View style={styles.cardContent}>
        <Ionicons
          name="heart"
          size={24}
          color="#FF3E70"
          style={styles.heartIcon}
        />
        <View>
          <Text style={styles.cardName}>
            {item.name} · {item.age}세
          </Text>
          <Text style={styles.cardLocation}>{item.location}</Text>
        </View>
      </View>
    </ImageBackground>
  );

  // 데이터 로딩 중일 때 맨 밑에 빙글빙글 도는 스피너 보여주기
  const renderFooter = () => {
    if (!isLoading) return null;
    return (
      <View style={styles.loaderFooter}>
        <ActivityIndicator size="small" color="#FF3E70" />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <DevBackHeader title="마음" />
      {renderTopTabs()}

      {/* ✨ 해결: FlatList를 감싸는 View와 FlatList 자체에 flex: 1을 추가했습니다! */}
      <View style={{ flex: 1 }}>
        <FlatList
          style={{ flex: 1 }}
          data={data}
          keyExtractor={(item) => item.id}
          numColumns={2}
          renderItem={renderCard}
          contentContainerStyle={styles.listContent}
          columnWrapperStyle={styles.columnWrapper}
          showsVerticalScrollIndicator={false}
          onEndReached={loadMoreData}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#FFF" },
  topTabs: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    paddingTop: 16,
    paddingBottom: 12,
  },
  tabText: { fontSize: 15, color: "#9CA3AF", fontWeight: "600" },
  activeTabText: { color: "#1F2937" },
  activeIndicator: {
    position: "absolute",
    bottom: -1,
    width: "100%",
    height: 2,
    backgroundColor: "#FF3E70",
  },
  listContent: { padding: 16, paddingBottom: 120 },
  columnWrapper: { justifyContent: "space-between", marginBottom: 16 },
  card: { width: CARD_WIDTH, height: CARD_WIDTH * 1.4, borderRadius: 12 },
  cardImage: { borderRadius: 12 },
  cardDarkOverlay: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    height: "50%",
    backgroundColor: "rgba(0,0,0,0.4)",
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  cardContent: { flex: 1, justifyContent: "space-between", padding: 12 },
  heartIcon: { alignSelf: "flex-end" },
  cardName: {
    color: "#FFF",
    fontSize: 15,
    fontWeight: "bold",
    marginBottom: 4,
  },
  cardLocation: { color: "#FFF", fontSize: 13 },
  loaderFooter: { paddingVertical: 20, alignItems: "center" },
});
