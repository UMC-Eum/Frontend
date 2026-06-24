import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  ImageBackground,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import Svg, {
  Defs,
  LinearGradient,
  Rect,
  Stop,
} from "react-native-svg";

const FALLBACK_PROFILE_IMAGE =
  "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&q=85&auto=format&fit=crop";

type ProfilePreviewCardProps = {
  imageUri?: string | null;
  name: string;
  age?: number | null;
  location?: string;
  keywords: string[];
};

export default function ProfilePreviewCard({
  imageUri,
  name,
  age,
  location = "서울 광진구",
  keywords,
}: ProfilePreviewCardProps) {
  const { width: windowWidth } = useWindowDimensions();
  const cardWidth = Math.min(Math.max(windowWidth - 40, 280), 372);
  const cardHeight = Math.round(cardWidth * (472 / 372));
  const displayKeywords = keywords.slice(0, 4);
  const sourceUri =
    imageUri && imageUri !== "default" ? imageUri : FALLBACK_PROFILE_IMAGE;

  return (
    <ImageBackground
      source={{ uri: sourceUri }}
      style={[styles.card, { width: cardWidth, height: cardHeight }]}
      imageStyle={styles.image}
    >
      <Svg style={styles.scrim} pointerEvents="none">
        <Defs>
          <LinearGradient
            id="profilePreviewScrim"
            x1="0"
            y1="0"
            x2="0"
            y2="1"
          >
            <Stop offset="0" stopColor="#000000" stopOpacity="0" />
            <Stop offset="0.44" stopColor="#000000" stopOpacity="0" />
            <Stop offset="0.68" stopColor="#000000" stopOpacity="0.56" />
            <Stop offset="1" stopColor="#000000" stopOpacity="0.76" />
          </LinearGradient>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#profilePreviewScrim)" />
      </Svg>
      <View style={styles.content}>
        <View style={styles.nameRow}>
          <Text style={styles.name} numberOfLines={1}>
            {name || "루씨"} {age ?? 53}세
          </Text>
          <Ionicons name="checkmark-circle" size={21} color="#FFFFFF" />
        </View>

        <View style={styles.locationRow}>
          <Ionicons name="location-sharp" size={20} color="#FFFFFF" />
          <Text style={styles.location} numberOfLines={1}>
            {location}
          </Text>
        </View>

        {displayKeywords.length > 0 ? (
          <View style={styles.chipList}>
            {displayKeywords.map((keyword) => (
              <View key={keyword} style={styles.chip}>
                <Text style={styles.chipText} numberOfLines={1}>
                  {keyword}
                </Text>
              </View>
            ))}
          </View>
        ) : null}
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  card: {
    overflow: "hidden",
    justifyContent: "flex-end",
    borderRadius: 14,
    backgroundColor: "#D9D9D9",
  },
  image: {
    borderRadius: 14,
    resizeMode: "cover",
  },
  scrim: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    gap: 12,
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  name: {
    flexShrink: 1,
    fontSize: 24,
    lineHeight: 30,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  location: {
    flexShrink: 1,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "500",
    color: "#FFFFFF",
  },
  chipList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  chip: {
    height: 32,
    justifyContent: "center",
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.28)",
    backgroundColor: "rgba(255, 255, 255, 0.24)",
  },
  chipText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "500",
    color: "#FFFFFF",
  },
});
