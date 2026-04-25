import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { IconChat, IconHeart, IconHome, IconPerson } from "./SvgIcons";

export type IconName = "home" | "heart" | "chat" | "person";

export interface TabItem {
  id: string; // 탭을 구분하는 고유 식별자
  iconName: IconName; // 커스텀 SVG 아이콘 이름 매핑
  label: string; // 아이콘 밑에 보여질 글씨 (예: '홈', '마이')
  badgeCount?: number; // 안 읽은 알림 숫자 표시용 (예: 채팅 99+)
  hasDotBadge?: boolean; // 우측 상단 핑크색 점 표시용 (예: 새로운 알림이 있는 '마음' 아이콘)
}

interface NavbarProps {
  tabs: TabItem[]; // 표시할 탭 배열 데이터
  activeTabId: string; // 현재 선택되어 있는 탭의 ID
  onTabPress: (id: string) => void; // 특정 탭을 눌렀을 때 부모에게 알려주는 콜백 함수
  activeColor?: string; // 활성화되었을 때 아이콘과 텍스트 색상
  inactiveColor?: string; // 비활성화 상태의 아이콘과 텍스트 색상
}

/**
 * 앱 하단에 위치하는 네비게이션 바(탭 바) 컴포넌트입니다.
 */
export const Navbar: React.FC<NavbarProps> = ({
  tabs,
  activeTabId,
  onTabPress,
  activeColor = "#000000",
  inactiveColor = "#B0B0B0",
}) => {
  return (
    <View style={styles.container}>
      {/* 배열을 순회하며(.map) 각각의 탭 요소를 렌더링합니다 */}
      {tabs.map((tab) => {
        const isActive = activeTabId === tab.id; // 현재 탭이 켜져있는지 여부
        const color = isActive ? activeColor : inactiveColor;

        return (
          <TouchableOpacity
            key={tab.id} // 리스트 렌더링 시 React가 각각을 식별하게 해주는 고유 키
            style={styles.tabItem}
            onPress={() => onTabPress(tab.id)}
            activeOpacity={0.7}
          >
            <View style={styles.iconContainer}>
              {/* 커스텀 SVG 아이콘 렌더링 */}
              {tab.iconName === "home" && (
                <IconHome width={24} height={24} color={color} />
              )}
              {tab.iconName === "heart" && (
                <IconHeart width={24} height={24} color={color} />
              )}
              {tab.iconName === "chat" && (
                <IconChat width={24} height={24} color={color} />
              )}
              {tab.iconName === "person" && (
                <IconPerson width={24} height={24} color={color} />
              )}

              {/* 뱃지(숫자)가 존재하고 0보다 클 때만 렌더링합니다 */}
              {tab.badgeCount !== undefined && tab.badgeCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {/* 숫자가 99가 넘어가면 99+로 축약합니다 */}
                    {tab.badgeCount > 99 ? "99+" : tab.badgeCount}
                  </Text>
                </View>
              )}
              {/* 점 뱃지(Dot)가 켜져 있을 때만 핑크색 원을 렌더링합니다 */}
              {tab.hasDotBadge && <View style={styles.dotBadge} />}
            </View>
            {/* 글씨 색상도 활성화 여부에 따라 동적으로 바뀝니다 */}
            <Text style={[styles.label, { color }]}>{tab.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row", // 가로 방향으로 나열
    justifyContent: "space-around", // 아이템 사이의 간격을 동일하게 띄움 (균등 분할)
    alignItems: "center", // 세로 높이 기준 중앙 정렬
    backgroundColor: "#FFFFFF",
    paddingVertical: 12,
    paddingBottom: 24, // 아이폰 하단 홈 인디케이터 바(노치 바)를 고려한 하단 여백 추가
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    // 그림자 속성 (iOS 전용)
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    // 그림자 속성 (Android 전용)
    elevation: 8,
  },
  tabItem: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1, // 각 탭이 동일한 너비(1:1:1:1)를 가지도록 설정
  },
  iconContainer: {
    position: "relative", // 내부의 badge 들이 absolute 좌표를 잡을 수 있도록 기준이 됨
    marginBottom: 4,
  },
  badge: {
    position: "absolute", // iconContainer 기준으로 우측 상단에 강제 고정
    top: -6,
    right: -14,
    backgroundColor: "#FC3367",
    borderRadius: 12, // 완전 둥근 형태로
    paddingHorizontal: 5,
    paddingVertical: 2,
    minWidth: 20, // 숫자가 작아도 최소한 원에 가까운 모양이 되도록 최소 너비 보장
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    color: "#FFF",
    fontSize: 10,
    fontWeight: "bold",
  },
  dotBadge: {
    position: "absolute", // iconContainer 우측 상단 부착
    top: 0,
    right: -2,
    backgroundColor: "#FC3367",
    width: 6,
    height: 6,
    borderRadius: 3, // width/height의 절반을 주면 완전한 원이 됨
  },
  label: {
    fontSize: 12,
    fontWeight: "500",
  },
});
