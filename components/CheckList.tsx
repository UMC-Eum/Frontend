import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

interface CheckListProps {
  title: string;
  subTitle?: string;
  large?: boolean;
}

const CheckList = ({ title, subTitle, large = false }: CheckListProps) => {
  const [isChecked, setIsChecked] = React.useState(false);
  const onCheckPress = () => {
    setIsChecked(!isChecked);
  };
  const onArrowPress = () => {
    // 상세 페이지로 이동하는 로직을 여기에 작성하세요
    console.log("상세 페이지로 이동");
  };
  return (
    <View style={[styles.container, large && styles.containerLarge]}>
      <Pressable
        onPress={onCheckPress}
        style={styles.checkboxWrapper}
        hitSlop={10}
      >
        <View
          style={[
            styles.checkbox,
            large && styles.checkboxLarge,
            isChecked && styles.checkboxActive,
          ]}
        >
          {isChecked && (
            <Ionicons name="checkmark" size={large ? 20 : 16} color="white" />
          )}
        </View>
      </Pressable>

      <Pressable onPress={onArrowPress} style={styles.detailWrapper}>
        <View style={styles.textGroup}>
          <Text style={[styles.title, large && styles.titleLarge]}>
            {title}
          </Text>
          {subTitle && <Text style={[styles.subTitle]}>{subTitle}</Text>}
        </View>
        <Ionicons
          name="chevron-forward"
          size={large ? 28 : 24}
          color="#cbd5e1"
        />
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: 68,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    backgroundColor: "white",
  },
  // Large 상태일 때 컨테이너 높이 확장
  containerLarge: {
    height: 80,
  },
  checkboxWrapper: {
    marginRight: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#e2e8f0",
    justifyContent: "center",
    alignItems: "center",
  },
  // Large 상태일 때 체크박스 크기 확장
  checkboxLarge: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  checkboxActive: {
    backgroundColor: "#ff3e70",
    borderColor: "#ff3e70",
  },
  detailWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
  },
  textGroup: {
    flexDirection: "row",
    alignItems: "center",
  },
  title: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1f2937",
  },
  // Large 상태일 때 제목 폰트 크기
  titleLarge: {
    fontWeight: "bold",
    fontSize: 18,
  },
  subTitle: {
    fontSize: 14,
    color: "#9ca3af",
    marginLeft: 8,
  },
});

export default CheckList;
