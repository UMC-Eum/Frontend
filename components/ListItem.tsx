import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";

// 오른쪽에 어떤 요소를 보여줄지 정하는 타입입니다.
export type RightElementType = "switch" | "chevron" | "text-chevron" | "none";

interface ListItemProps {
  title: string; // 리스트의 주된 제목
  subtitle?: string; // (선택) 하단에 나타나는 옅은 핑크색 추가 텍스트
  rightElementType?: RightElementType; // 우측 요소 형태 (기본값: chevron(화살표))
  rightText?: string; // 'text-chevron' 선택 시 보여줄 우측 텍스트 내용
  isSwitchOn?: boolean; // 우측 요소가 'switch' 일 때 켜져있는지 상태값
  onSwitchChange?: (value: boolean) => void; // 스위치를 토글할 때 실행되는 함수
  onPress?: () => void; // 리스트 전체를 터치할 수 있게 하고 싶다면 넘겨주는 함수
}

/**
 * 리스트 아이템 UI를 그리는 컴포넌트입니다.
 * 설정 화면 등에서 각 행을 표현할 때 사용됩니다.
 */
export const ListItem: React.FC<ListItemProps> = ({
  title,
  subtitle,
  rightElementType = "chevron",
  rightText,
  isSwitchOn = false,
  onSwitchChange,
  onPress,
}) => {
  // 우측 요소의 타입에 따라 다른 형태의 UI를 리턴하는 헬퍼 함수입니다.
  const renderRightElement = () => {
    switch (rightElementType) {
      case "switch":
        return (
          // 네이티브 앱 기본 스위치. trackColor와 thumbColor로 안드로이드/iOS 스타일을 어느 정도 통일합니다.
          <Switch
            value={isSwitchOn}
            onValueChange={onSwitchChange}
            trackColor={{ false: "#E5E7EB", true: "#FC3367" }}
            thumbColor={"#FFFFFF"}
          />
        );
      case "text-chevron":
        return (
          <View style={styles.rightContainer}>
            {rightText && <Text style={styles.rightText}>{rightText}</Text>}
            <Ionicons name="chevron-forward" size={20} color="#636970" />
          </View>
        );
      case "chevron":
        return <Ionicons name="chevron-forward" size={20} color="#636970" />;
      case "none":
      default:
        // 'none' 이면 아무것도 그리지 않습니다.
        return null;
    }
  };

  // onPress 이벤트가 주어졌거나, 화살표 등이 있어서 누를 수 있어야 하는 경우 TouchableOpacity를 쓰고,
  // 단순 보기용 (ex. 화살표 없고 스위치만 있음) 일 때는 일반 View 껍데기를 씁니다.
  const Component =
    onPress ||
    rightElementType === "chevron" ||
    rightElementType === "text-chevron"
      ? TouchableOpacity
      : View;

  return (
    <Component
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={
        !onPress &&
        rightElementType !== "chevron" &&
        rightElementType !== "text-chevron"
      }
    >
      <View style={styles.contentContainer}>
        <Text style={styles.title}>{title}</Text>
        {/* subtitle이 존재할 때만 아래 텍스트를 렌더링 (조건부 렌더링) */}
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
      <View>{renderRightElement()}</View>
    </Component>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row", // 내용 텍스트 부분과 우측 요소를 좌우로 배치합니다
    alignItems: "center", // 세로 높이 기준 중앙 정렬
    justifyContent: "space-between", // 내부 요소들을 양 끝으로 최대한 밀어냅니다 (좌 우 배치)
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: "#FFFFFF",
  },
  contentContainer: {
    flex: 1, // 글씨 컨테이너가 가질 수 있는 최대한의 빈 공간을 챙기도록 설정
    justifyContent: "center",
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#202020",
    marginBottom: 10, // subtitle과 간격을 살짝 벌려줍니다.
  },
  subtitle: {
    fontSize: 13,
    color: "#FF6B8E", // 사용자 요청에 맞춘 옅은 핑크 디자인
  },
  rightContainer: {
    flexDirection: "row",
    alignItems: "center", // 텍스트와 화살표의 상하 중앙을 맞춥니다.
  },
  rightText: {
    fontSize: 15,
    color: "#636970",
    fontWeight: "600",
    marginRight: 8, // 화살표와의 거리
  },
});
