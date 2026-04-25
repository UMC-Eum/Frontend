import CheckList from "@/components/CheckList";
import NotificationItem from "@/components/NotificationItem";
import TabBar from "@/components/TabBar";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <TabBar />
        <NotificationItem
          userId="user123"
          userName="John Doe"
          notificationContent="You have a new message!"
          timestamp={new Date()}
        />
        <CheckList
          title="할 일 목록"
          subTitle="오늘 해야 할 일들을 확인하세요"
          large={false}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  container: {
    flex: 1,
  },
});
