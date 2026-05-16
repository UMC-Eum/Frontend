import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import { Image, Pressable, StyleSheet } from "react-native";

/**
 * 스플래시 화면
 * - 흰색 배경 + 중앙 로고 이미지
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
      {/* 스플래시 로고 이미지 */}
      <Image
        source={require("@/assets/images/splash-image.png")}
        style={styles.logoImage}
        resizeMode="contain"
      />
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
  logoImage: {
    width: 116,
    height: 101,
  },
});
