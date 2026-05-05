import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Club } from "@/types/search";

type ClubRowProps = {
  club: Club;
  featured?: boolean;
};

export default function ClubRow({ club, featured = false }: ClubRowProps) {
  return (
    <Pressable style={[styles.clubRow, featured && styles.featuredClubRow]}>
      <View style={styles.clubThumbnail} />
      <View style={styles.clubInfo}>
        <Text style={styles.clubTitle} numberOfLines={1}>
          {club.title}
        </Text>
        {featured && (
          <Text style={styles.clubDescription} numberOfLines={2}>
            {club.description}
          </Text>
        )}
        <Text style={styles.clubMetaText} numberOfLines={1}>
          {club.district} · {club.host}
        </Text>
        <View style={styles.clubMemberRow}>
          <Ionicons name="person" size={12} color="#AEB7BE" />
          <Text style={styles.clubMemberText}>
            {club.members}명 참석중 ({club.date})
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  clubRow: {
    minHeight: 88,
    flexDirection: "row",
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
  },
  clubInfo: {
    flex: 1,
    justifyContent: "center",
    minWidth: 0,
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
    marginTop: 6,
  },
  clubMemberText: {
    fontSize: 11,
    color: "#9BA5AD",
  },
});
