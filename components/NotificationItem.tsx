import { Image, Pressable, StyleSheet, Text, View } from "react-native";

interface NotificationItemProps {
  isRead?: boolean;
  onPress?: () => void;
  userId: string;
  userName: string;
  userProfileImage?: string;
  notificationContent: string;
  timestamp: Date;
  timeLabel?: string;
}

const NotificationItem = ({
  isRead = false,
  onPress,
  userId,
  userName,
  userProfileImage,
  notificationContent,
  timestamp,
  timeLabel,
}: NotificationItemProps) => {
  const displayTime = timeLabel ?? formatRelativeTime(timestamp);

  return (
    <Pressable
      onPress={onPress}
      testID={`notification-${userId}`}
      accessibilityRole="button"
      accessibilityLabel={`${userName}님의 알림: ${notificationContent}`}
      accessibilityState={{ selected: !isRead }}
    >
      <View
        style={[
          styles.container,
          { backgroundColor: isRead ? "#FFFFFF" : "#FFF4F6" },
        ]}
      >
        {userProfileImage ? (
          <Image
            source={{ uri: userProfileImage }}
            style={styles.profileImage}
          />
        ) : (
          <View style={[styles.profileImage, styles.defaultProfileImage]} />
        )}

        <View style={styles.textContainer}>
          <Text style={styles.mainText} numberOfLines={2}>
            {notificationContent}
          </Text>

          <Text style={styles.timeText}>{displayTime}</Text>
        </View>
      </View>
    </Pressable>
  );
};

const formatRelativeTime = (timestamp: Date) => {
  const diffMinutes = Math.max(
    1,
    Math.floor((Date.now() - timestamp.getTime()) / 60000),
  );

  if (diffMinutes < 60) {
    return `${diffMinutes}분전`;
  }

  const diffHours = Math.floor(diffMinutes / 60);
  return `${diffHours}시간전`;
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    minHeight: 84,
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: 28,
    paddingVertical: 14,
  },
  profileImage: {
    width: 54,
    height: 54,
    borderRadius: 27,
  },
  defaultProfileImage: {
    backgroundColor: "#2B2B2B",
  },
  textContainer: {
    marginLeft: 16,
    flex: 1,
    justifyContent: "flex-start",
    paddingTop: 2,
  },
  mainText: {
    fontSize: 17,
    lineHeight: 24,
    fontWeight: "600",
    color: "#222222",
    marginBottom: 6,
  },
  timeText: {
    fontSize: 14,
    lineHeight: 18,
    color: "#A6AFB6",
    fontWeight: "500",
  },
});

export default NotificationItem;
