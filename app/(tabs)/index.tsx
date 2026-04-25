import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link } from "expo-router";

import TabBar from "../(tabs)/TabBar";

export default function HomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-gray-200">
      <View className="flex-1 items-center justify-center">
        {/* 임시 테스트용 링크 버튼 */}
        <Link href="/test">
          <Text style={{ backgroundColor: '#FC3367', color: 'white', padding: 16, borderRadius: 24, fontWeight: 'bold', marginBottom: 20, overflow: 'hidden' }}>
            컴포넌트 테스트 페이지 열기 👉
          </Text>
        </Link>
        
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
