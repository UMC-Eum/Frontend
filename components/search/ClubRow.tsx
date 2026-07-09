import { Ionicons } from "@expo/vector-icons";
import { Image } from "@/components/Image";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

export type ClubRowItem = {
  id: string;
  title: string;
  description?: string;
  district?: string;
  host?: string;
  members?: number;
  date?: string;
  thumbnailUrl?: string | null;
};

type ClubRowProps = {
  club: ClubRowItem;
  featured?: boolean;
  onPress?: () => void;
};

export default function ClubRow({ club, featured = false, onPress }: ClubRowProps) {
  const metaText = [club.district, club.host].filter(Boolean).join(" · ");

  return (
    <Pressable
      style={[styles.clubRow, featured && styles.featuredClubRow]}
      onPress={onPress}
    >
      <View style={styles.clubThumbnail}>
        {club.thumbnailUrl ? (
          <Image
            source={{ uri: club.thumbnailUrl }}
            style={styles.clubThumbnailImage}
            contentFit="cover"
          />
        ) : null}
      </View>
      <View style={[styles.clubInfo, featured && styles.featuredClubInfo]}>
        <View>
          <Text style={styles.clubTitle} numberOfLines={1}>
            {club.title}
          </Text>
          {featured && (
            <Text style={styles.clubDescription} numberOfLines={2}>
              {club.description}
            </Text>
          )}
          {metaText ? (
            <Text style={styles.clubMetaText} numberOfLines={1}>
              {metaText}
            </Text>
          ) : null}
        </View>
        {club.members != null ? (
          <View style={styles.clubMemberRow}>
            <Ionicons name="person" size={12} color="#AEB7BE" />
            <Text style={styles.clubMemberText}>
              {club.members}명 참석중{club.date ? ` (${club.date})` : ""}
            </Text>
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  clubRow: {
    minHeight: 88,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: "#FFFFFF",
  },
  featuredClubRow: {
    minHeight: 108,
  },
  clubThumbnail: {
    width: 78,
    height: 78,
    borderRadius: 8,
    backgroundColor: "#D7D7D7",
    overflow: "hidden",
  },
  clubThumbnailImage: {
    width: "100%",
    height: "100%",
  },
  clubInfo: {
    flex: 1,
    height: 78,
    justifyContent: "space-between",
    paddingVertical: 5,
    minWidth: 0,
  },
  featuredClubInfo: {
    height: 92,
    paddingVertical: 2,
  },
  clubTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#202020",
  },
  clubDescription: {
    marginTop: 4,
    fontSize: 12,
    lineHeight: 17,
    color: "#565F66",
  },
  clubMetaText: {
    marginTop: 5,
    fontSize: 11,
    color: "#636970",
  },
  clubMemberRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  clubMemberText: {
    fontSize: 11,
    color: "#9BA5AD",
  },
});
