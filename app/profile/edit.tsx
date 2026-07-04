import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import { postPresign, uploadFileToS3 } from "@/api/onboarding/onboardingApi";
import CircleImageCropper, {
  CircleCropAsset,
  CircleCropResult,
} from "@/components/profile/CircleImageCropper";
import {
  useMyProfileQuery,
  useUpdateMyProfileMutation,
} from "@/hooks/api/useUsers";
import { KEYBOARD_AVOIDING_BEHAVIOR } from "@/constants/keyboard";
import { useFastInputScroll } from "@/hooks/useFastInputScroll";

const ACCENT = "#FC3367";
const TEXT = "#202020";
const MUTED = "#A6AFB6";
const PROFILE_IMAGE_PURPOSE = "PROFILE_IMAGE";
const DEFAULT_PROFILE_IMAGE =
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=240&h=240&fit=crop&crop=faces";
const NAME_INPUT_SCROLL_Y = 150;
const INTRO_INPUT_SCROLL_Y = 280;

type PickedProfileImage = {
  uri: string;
  mimeType: string;
};

export default function ProfileEditScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const inputScroll = useFastInputScroll();
  const myProfileQuery = useMyProfileQuery();
  const updateMyProfileMutation = useUpdateMyProfileMutation();
  const profile = myProfileQuery.data;
  const [nickname, setNickname] = useState("");
  const [introText, setIntroText] = useState("");
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [pickedImage, setPickedImage] = useState<PickedProfileImage | null>(
    null,
  );
  const [previewAsset, setPreviewAsset] = useState<CircleCropAsset | null>(
    null,
  );
  const [showActionSheet, setShowActionSheet] = useState(false);
  const [pendingAction, setPendingAction] = useState<"gallery" | null>(null);

  useEffect(() => {
    if (!profile) return;

    setNickname(profile.nickname ?? "");
    setIntroText(profile.introText ?? "");
    setImageUri(profile.profileImageUrl || null);
  }, [profile]);

  const isSubmitting = updateMyProfileMutation.isPending;
  const canSubmit = useMemo(
    () => nickname.trim().length > 0 && introText.trim().length > 0 && !isSubmitting,
    [introText, isSubmitting, nickname],
  );

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace("/(tabs)/my" as never);
  };

  const handlePhotoPick = () => {
    if (isSubmitting) return;

    setShowActionSheet(true);
  };

  const handlePickFromGallery = () => {
    setShowActionSheet(false);

    if (Platform.OS === "ios") {
      setPendingAction("gallery");
      return;
    }

    void runGalleryPicker();
  };

  const onModalDismiss = async () => {
    if (pendingAction !== "gallery") return;

    setPendingAction(null);
    await runGalleryPicker();
  };

  const runGalleryPicker = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: false,
        quality: 0.85,
      });

      if (result.canceled || result.assets.length === 0) return;

      const asset = result.assets[0];
      setPreviewAsset({
        uri: asset.uri,
        width: asset.width,
        height: asset.height,
      });
    } catch (error) {
      if (__DEV__) {
        console.log("Profile edit image pick error:", error);
      }
      Alert.alert("사진 선택 실패", "사진을 다시 선택해주세요.");
    }
  };

  const handleDefaultProfile = () => {
    setPickedImage(null);
    setImageUri(DEFAULT_PROFILE_IMAGE);
    setShowActionSheet(false);
  };

  const handleCancelAction = () => {
    setShowActionSheet(false);
  };

  const handleCropConfirm = (croppedImage: CircleCropResult) => {
    setPickedImage({
      uri: croppedImage.uri,
      mimeType: "image/jpeg",
    });
    setImageUri(croppedImage.uri);
    setPreviewAsset(null);
  };

  const handleCropCancel = () => {
    setPreviewAsset(null);
  };

  const handleCropError = (error: unknown) => {
    if (__DEV__) {
      console.log("Profile edit crop error:", error);
    }
    Alert.alert("사진 설정 실패", "사진을 다시 선택해주세요.");
  };

  const handleSubmit = async () => {
    const nextNickname = nickname.trim();
    const nextIntroText = introText.trim();

    if (!nextNickname || !nextIntroText || isSubmitting) return;

    try {
      let profileImageUrl =
        imageUri && imageUri.startsWith("http") ? imageUri : undefined;

      if (pickedImage) {
        profileImageUrl = await uploadProfileImage(pickedImage);
      }

      await updateMyProfileMutation.mutateAsync({
        nickname: nextNickname,
        introText: nextIntroText,
        ...(profileImageUrl ? { profileImageUrl } : {}),
      });

      Alert.alert("저장 완료", "프로필이 수정되었습니다.", [
        {
          text: "확인",
          onPress: handleBack,
        },
      ]);
    } catch (error) {
      if (__DEV__) {
        console.log("Profile edit submit error:", error);
      }
      Alert.alert("저장 실패", "프로필을 다시 저장해주세요.");
    }
  };

  if (myProfileQuery.isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator color={ACCENT} />
      </SafeAreaView>
    );
  }

  if (previewAsset) {
    return (
      <CircleImageCropper
        asset={previewAsset}
        onCancel={handleCropCancel}
        onConfirm={handleCropConfirm}
        onError={handleCropError}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoiding}
        behavior={KEYBOARD_AVOIDING_BEHAVIOR}
      >
        <View style={styles.header}>
          <Pressable style={styles.headerButton} onPress={handleBack} hitSlop={12}>
            <Ionicons name="chevron-back" size={28} color={MUTED} />
          </Pressable>
          <Text style={styles.headerTitle}>프로필 수정</Text>
          <Pressable
            style={styles.doneButton}
            onPress={handleSubmit}
            disabled={!canSubmit}
            hitSlop={12}
          >
            <Text style={[styles.doneText, !canSubmit && styles.doneTextDisabled]}>
              {isSubmitting ? "저장중" : "완료"}
            </Text>
          </Pressable>
        </View>

        <ScrollView
          ref={inputScroll.scrollViewRef}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          scrollEventThrottle={inputScroll.scrollEventThrottle}
          onScroll={inputScroll.onScroll}
          contentContainerStyle={styles.content}
        >
          <Pressable style={styles.photoButton} onPress={handlePhotoPick}>
            <View style={styles.avatar}>
              <Image
                source={{ uri: imageUri || DEFAULT_PROFILE_IMAGE }}
                style={styles.avatarImage}
                resizeMode="cover"
              />
            </View>
            <View style={styles.cameraBadge}>
              <Ionicons name="camera" size={20} color="#FFFFFF" />
            </View>
          </Pressable>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>
              이름(별명)<Text style={styles.required}> *</Text>
            </Text>
            <TextInput
              value={nickname}
              onChangeText={setNickname}
              style={styles.input}
              maxLength={20}
              placeholder="이름을 입력해주세요"
              placeholderTextColor={MUTED}
              onFocus={() => inputScroll.scrollTo(NAME_INPUT_SCROLL_Y)}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>
              나의 소개<Text style={styles.required}> *</Text>
            </Text>
            <TextInput
              value={introText}
              onChangeText={setIntroText}
              style={[styles.input, styles.introInput]}
              multiline
              maxLength={255}
              placeholder="자기소개를 입력해주세요"
              placeholderTextColor={MUTED}
              textAlignVertical="top"
              onFocus={() => inputScroll.scrollTo(INTRO_INPUT_SCROLL_Y)}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal
        visible={showActionSheet}
        transparent
        animationType="slide"
        onRequestClose={handleCancelAction}
        onDismiss={onModalDismiss}
      >
        <Pressable style={styles.modalOverlay} onPress={handleCancelAction}>
          <View
            style={[styles.modalSheet, { paddingBottom: insets.bottom + 16 }]}
          >
            <View style={styles.modalGroup}>
              <Pressable
                style={({ pressed }) => [
                  styles.modalOption,
                  pressed && styles.modalOptionPressed,
                ]}
                onPress={handlePickFromGallery}
              >
                <Text style={styles.modalOptionText}>
                  촬영 또는 앨범에서 선택
                </Text>
              </Pressable>
              <View style={styles.modalDivider} />
              <Pressable
                style={({ pressed }) => [
                  styles.modalOption,
                  pressed && styles.modalOptionPressed,
                ]}
                onPress={handleDefaultProfile}
              >
                <Text style={styles.modalOptionText}>기본 프로필 선택</Text>
              </Pressable>
            </View>

            <Pressable
              style={({ pressed }) => [
                styles.modalCancel,
                pressed && styles.modalOptionPressed,
              ]}
              onPress={handleCancelAction}
            >
              <Text style={styles.modalCancelText}>취소</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

async function uploadProfileImage(asset: PickedProfileImage) {
  const contentType = asset.mimeType;
  const extension = contentTypeToImageExtension(contentType);
  const { uploadUrl, fileUrl } = await postPresign({
    fileName: `profile-${Date.now()}.${extension}`,
    contentType,
    purpose: PROFILE_IMAGE_PURPOSE,
  });
  const fileResponse = await fetch(asset.uri);
  const blob = await fileResponse.blob();
  const uploadBlob = blob.type ? blob : new Blob([blob], { type: contentType });

  await uploadFileToS3(uploadUrl, uploadBlob, contentType);

  return fileUrl;
}

function contentTypeToImageExtension(contentType: string) {
  if (contentType === "image/png") return "png";
  if (contentType === "image/webp") return "webp";

  return "jpg";
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  keyboardAvoiding: {
    flex: 1,
  },
  header: {
    height: 60,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  headerButton: {
    width: 44,
    height: 44,
    alignItems: "flex-start",
    justifyContent: "center",
  },
  headerTitle: {
    color: TEXT,
    fontSize: 20,
    fontWeight: "800",
  },
  doneButton: {
    width: 44,
    height: 44,
    alignItems: "flex-end",
    justifyContent: "center",
  },
  doneText: {
    color: ACCENT,
    fontSize: 14,
    fontWeight: "800",
  },
  doneTextDisabled: {
    color: MUTED,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 72,
    paddingBottom: 40,
  },
  photoButton: {
    alignSelf: "center",
    width: 122,
    height: 122,
    marginBottom: 64,
  },
  avatar: {
    width: 118,
    height: 118,
    overflow: "hidden",
    borderRadius: 59,
    backgroundColor: "#DDE2E5",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  cameraBadge: {
    position: "absolute",
    right: 0,
    bottom: 0,
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 22,
    backgroundColor: "#AAB3BA",
    borderWidth: 4,
    borderColor: "#FFFFFF",
  },
  fieldGroup: {
    marginBottom: 34,
  },
  label: {
    marginBottom: 10,
    color: TEXT,
    fontSize: 15,
    fontWeight: "800",
  },
  required: {
    color: ACCENT,
  },
  input: {
    minHeight: 52,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#E6EAED",
    borderRadius: 10,
    color: TEXT,
    fontSize: 15,
    fontWeight: "600",
    lineHeight: 21,
    backgroundColor: "#FAFBFC",
  },
  introInput: {
    minHeight: 104,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    paddingHorizontal: 16,
    paddingTop: 8,
    gap: 10,
  },
  modalGroup: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    overflow: "hidden",
  },
  modalOption: {
    height: 56,
    justifyContent: "center",
    alignItems: "center",
  },
  modalOptionPressed: {
    backgroundColor: "#F3F4F6",
  },
  modalOptionText: {
    color: "#1F2937",
    fontSize: 17,
    fontWeight: "500",
  },
  modalDivider: {
    height: 1,
    backgroundColor: "#E5E7EB",
  },
  modalCancel: {
    height: 56,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  modalCancelText: {
    color: "#1F2937",
    fontSize: 17,
    fontWeight: "600",
  },
});
