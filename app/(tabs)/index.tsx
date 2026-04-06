import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import TabBar from "../(tabs)/TabBar";

export default function HomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-gray-200">
      <View className="flex-1 items-center justify-center">
        <TabBar />
        <Pressable
          onPress={() => router.push('/test')}
          style={{ marginTop: 20, backgroundColor: '#FF3E70', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 10 }}
        >
          <Text style={{ color: '#fff', fontWeight: '600' }}>테스트 페이지</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
