import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import { Pressable, StyleSheet, View } from "react-native";

/**
 * 스플래시 화면
 * - 흰색 배경 + 중앙 로고 placeholder
 * - 2초 후 자동으로 로그인 화면으로 이동
 * - 터치해도 이동 가능
 */
export default function SplashScreen() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace("/onboarding/login");
    }, 2000);
    return () => clearTimeout(timer);
  }, [router]);

  const goToLogin = () => {
    router.replace("/onboarding/login");
  };

  return (
    <Pressable style={styles.container} onPress={goToLogin}>
      {/* 로고 placeholder — 나중에 Image 컴포넌트로 교체 */}
      <View style={styles.logoPlaceholder}>
        <View style={styles.logoInner} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },
  logoPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#FF3E70",
    opacity: 0.15,
    justifyContent: "center",
    alignItems: "center",
  },
  logoInner: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#FF3E70",
    opacity: 1,
  },
});
