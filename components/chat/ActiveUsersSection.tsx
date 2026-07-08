import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo } from "react";
import {
  AppState,
  FlatList,
  ListRenderItem,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { connectChatSocket, pingChatSocket } from "@/api/chats/chatSocketApi";
import { ActiveMemberListSkeleton } from "@/components/skeletons";
import { useActiveUsersInfiniteQuery } from "@/hooks/api/useUsers";
import { uniqueBy } from "@/utils/array";
import { IActiveUserItem } from "@/types/api/users/usersDTO";

const ACTIVE_USER_HEARTBEAT_INTERVAL_MS = 30_000;

export default function ActiveUsersSection() {
  const router = useRouter();
  const activeUsersQuery = useActiveUsersInfiniteQuery({ size: 20 });
  const { refetch } = activeUsersQuery;

  useEffect(() => {
    let isMounted = true;
    let heartbeatTimer: ReturnType<typeof setInterval> | null = null;
    const socket = connectChatSocket();

    const sendHeartbeat = async () => {
      if (AppState.currentState !== "active") return;

      try {
        await pingChatSocket(socket, 5000);
        if (isMounted) {
          void refetch();
        }
      } catch (error) {
        if (__DEV__) {
          console.log("[ActiveUsers] heartbeat error", error);
        }
      }
    };

    const startHeartbeat = () => {
      if (heartbeatTimer) return;
      void sendHeartbeat();
      heartbeatTimer = setInterval(
        sendHeartbeat,
        ACTIVE_USER_HEARTBEAT_INTERVAL_MS,
      );
    };

    const stopHeartbeat = () => {
      if (!heartbeatTimer) return;
      clearInterval(heartbeatTimer);
      heartbeatTimer = null;
    };

    startHeartbeat();

    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        startHeartbeat();
        return;
      }

      stopHeartbeat();
    });

    return () => {
      isMounted = false;
      stopHeartbeat();
      subscription.remove();
    };
  }, [refetch]);

  const activeUsers = useMemo(
    () =>
      uniqueBy(
        activeUsersQuery.data?.pages.flatMap((page) => page.items ?? []) ?? [],
        (item) => item.userId,
      ),
    [activeUsersQuery.data],
  );

  const isInitialLoading =
    activeUsersQuery.isLoading && activeUsers.length === 0;

  const openProfile = (item: IActiveUserItem) => {
    router.push({
      pathname: "/profile-detail",
      params: {
        userId: String(item.userId),
        name: item.nickname,
        image: item.profileImageUrl ?? "",
        location: item.areaName ?? "",
        age: item.age != null ? String(item.age) : "",
        isLiked: "false",
      },
    } as never);
  };

  const renderActiveUser: ListRenderItem<IActiveUserItem> = ({ item }) => (
    <Pressable
      style={styles.member}
      onPress={() => openProfile(item)}
      accessibilityRole="button"
      accessibilityLabel={`${item.nickname}님 프로필 보기`}
    >
      {item.profileImageUrl ? (
        <Image
          source={{ uri: item.profileImageUrl }}
          style={styles.memberImage}
          contentFit="cover"
          cachePolicy="memory-disk"
        />
      ) : (
        <View style={styles.memberImage} />
      )}
      <Text style={styles.memberLabel} numberOfLines={1}>
        {item.nickname} · {item.age}
      </Text>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>현재 활동중인 사람들이에요!</Text>
      <Text style={styles.subtitle}>편하게 소통해봐요!</Text>
      {isInitialLoading ? (
        <View style={styles.skeletonWrap}>
          <ActiveMemberListSkeleton />
        </View>
      ) : activeUsers.length === 0 ? (
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyText}>
            지금은 활동중인 사람이 없어요.
          </Text>
        </View>
      ) : (
        <FlatList
          data={activeUsers}
          keyExtractor={(item) => String(item.userId)}
          renderItem={renderActiveUser}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          onEndReached={() => {
            if (
              activeUsersQuery.hasNextPage &&
              !activeUsersQuery.isFetchingNextPage
            ) {
              activeUsersQuery.fetchNextPage();
            }
          }}
          onEndReachedThreshold={0.5}
        />
      )}
      <View style={styles.divider} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 4,
  },
  title: {
    paddingHorizontal: 20,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "800",
    color: "#202020",
  },
  subtitle: {
    marginTop: 4,
    paddingHorizontal: 20,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "600",
    color: "#8B949E",
  },
  skeletonWrap: {
    marginTop: 16,
    paddingHorizontal: 20,
  },
  emptyWrap: {
    height: 84,
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "600",
    color: "#A6AFB6",
  },
  listContent: {
    marginTop: 16,
    paddingHorizontal: 20,
    gap: 12,
  },
  member: {
    width: 86,
  },
  memberImage: {
    width: 86,
    height: 80,
    borderRadius: 10,
    marginBottom: 8,
    backgroundColor: "#D9D9D9",
  },
  memberLabel: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "700",
    color: "#202020",
  },
  divider: {
    marginTop: 20,
    height: 1,
    backgroundColor: "#EFF1F4",
  },
});
