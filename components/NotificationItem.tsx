import { Image, Pressable, StyleSheet, Text, View } from "react-native";

interface NotificationItemProps {
  isRead?: boolean;
  onPress?: () => void;
  userId: string;
  userName: string;
  userProfileImage?: string;
  notificationContent: string;
  timestamp: Date;
}

const NotificationItem = ({
  isRead = false,
  onPress,
  userId,
  userName,
  userProfileImage,
  notificationContent,
  timestamp,
}: NotificationItemProps) => {
  return (
    <Pressable onPress={onPress}>
      <View
        style={[
          styles.container,
          { backgroundColor: isRead ? "white" : "#fff0f2" },
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
          <Text style={styles.mainText} numberOfLines={1}>
            {notificationContent}
          </Text>

          <Text style={styles.timeText}>10분전</Text>
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: 72,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  profileImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  defaultProfileImage: {
    backgroundColor: "black",
  },
  textContainer: {
    marginLeft: 12,
    flex: 1,
    justifyContent: "center",
  },
  mainText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#111827",
    marginBottom: 4,
  },
  timeText: {
    fontSize: 14,
    color: "#9ca3af",
  },
});

export default NotificationItem;
