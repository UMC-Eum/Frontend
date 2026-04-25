import { FontAwesome } from "@expo/vector-icons";
import React from "react";
import {
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";

interface ImageCardProps {
  imageUrl?: string; // 원격 혹은 로컬 파일의 이미지 주소 (옵션)
  isSelected?: boolean; // 선택된 상태인지 여부 (핑크색 테두리 + 우측 상단 체크 표시)
  onPress?: () => void; // 누를 때 발생하는 이벤트
  style?: ViewStyle; // 외부에서 카드 전체에 주고 싶은 부가 스타일
}

/**
 * 터치해서 이미지를 나타내거나 다중 선택/단일 선택 등에 쓸 수 있는 카드 컴포넌트입니다.
 */
export const ImageCard: React.FC<ImageCardProps> = ({
  imageUrl,
  isSelected = false,
  onPress,
  style,
}) => {
  return (
    <TouchableOpacity
      // style 요소가 배열로 묶여있으며, isSelected 여부에 따라 테두리 스타일이 동적으로 추가됩니다.
      style={[
        styles.container,
        isSelected ? styles.selected : styles.unselected,
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.8} // 이미지는 글자가 아니므로 누를 때 투명해지는 정도를 살짝만! (80%)
    >
      {/* 
        React Native에서는 웹의 <img src="..."> 대신 <Image source={{ uri: "..." }}> 를 사용합니다. 
        웹 URL이라면 항상 uri 객체 형태로 넘기고, 로컬 파일이면 require('./img.png') 를 씁니다.
      */}
      {imageUrl && (
        <Image
          source={{ uri: imageUrl }}
          style={styles.image}
          resizeMode="cover" // 뷰 크기에 꽉 차게 비율 유지하면서 자르기 (CSS의 object-fit: cover 와 동일)
        />
      )}

      {/* FontAwesome의 check가 기본적으로 훨씬 두껍습니다. */}
      {isSelected && (
        <View style={styles.checkContainer}>
          <View style={styles.checkCircle}>
            <FontAwesome name="check" size={14} color="#FFFFFF" />
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 136, // 카드 기본 가로 크기
    height: 136, // 일관성을 위해 기본 정사각형으로 고정 (부모에서 width: '100%', aspectRatio: 1 등으로 변경 가능)
    borderWidth: 3,
    marginRight: 10,
    overflow: "hidden", // (핵심) 카드가 둥근데(borderRadius), 내부 이미지가 뾰족하게 튀어나가면 모서리를 따라 둥글게 잘리도록 막습니다. (CSS overflow: hidden과 동일)
    position: "relative", // checkContainer가 absolute로 잡혀서 우측 상단에 붙기 위한 기준점 역할
    backgroundColor: "#F3F4F6", // 기본 회색 배경 (이미지가 없을 때나 로딩 중일 때 보임)
  },
  unselected: {
    borderColor: "transparent", // 선택되지 않았을 때는 외곽선을 투명하게 해서 박스 크기(공간)만 유지합니다.
  },
  selected: {
    borderColor: "#FC3367", // 선택되면 핑크색 줄 렌더링
  },
  image: {
    width: "100%",
    height: "100%",
  },
  checkContainer: {
    position: "absolute", // 카드를 기준으로 우측 상단 윗부분에 완전히 떠 있게 만듭니다.
    top: 6,
    right: 6,
    backgroundColor: "#FFFFFF", // 아이콘 외곽 테두리 효과를 위해 설정
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#FC3367",
    alignItems: "center",
    justifyContent: "center",
  },
});
