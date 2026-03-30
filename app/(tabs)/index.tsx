import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import TabBar from "../(tabs)/TabBar";

export default function HomeScreen() {
  return (
    <SafeAreaView className="flex-1 bg-gray-200">
      <View className="flex-1 items-center justify-center">
        <TabBar />
      </View>
    </SafeAreaView>
  );
}
