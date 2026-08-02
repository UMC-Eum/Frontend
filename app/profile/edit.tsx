import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { Image } from "@/components/Image";
import { KeyboardAvoidingView } from "@/components/KeyboardCompat";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import { postPresign, uploadFileToS3 } from "@/api/onboarding/onboardingApi";
import { getApiErrorMessage } from "@/api/axiosInstance";
import ProfileVoiceCard from "@/assets/images/profile-voice/profile-voice-card.svg";
import CircleImageCropper, {
  CircleCropAsset,
  CircleCropResult,
} from "@/components/profile/CircleImageCropper";
import DefaultProfileAvatar from "@/components/profile/DefaultProfileAvatar";
import {
  useMyProfileQuery,
  useUpdateMyProfileMutation,
} from "@/hooks/api/useUsers";
import { KEYBOARD_AVOIDING_BEHAVIOR } from "@/constants/keyboard";
import { DEFAULT_PROFILE_IMAGE_URI } from "@/constants/defaultProfileImage";
import { useOnboardingDraftStore } from "@/stores/onboardingDraftStore";
import { useFastInputScroll } from "@/hooks/useFastInputScroll";
import { ensurePermission } from "@/utils/permissions";

const ACCENT = "#FC3367";
const TEXT = "#202020";
const MUTED = "#A6AFB6";
const PROFILE_IMAGE_PURPOSE = "PROFILE_IMAGE";
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
  const setDraftNickname = useOnboardingDraftStore((state) => state.setNickname);
  const setDraftAge = useOnboardingDraftStore((state) => state.setAge);
  const setDraftGender = useOnboardingDraftStore((state) => state.setGender);
  const setDraftArea = useOnboardingDraftStore((state) => state.setArea);
  const setDraftBirthDate = useOnboardingDraftStore((state) => state.setBirthDate);
  const setDraftProfileImageUri = useOnboardingDraftStore(
    (state) => state.setProfileImageUri,
  );
  const setDraftIntroText = useOnboardingDraftStore(
    (state) => state.setIntroText,
  );
  const setDraftSelectedKeywords = useOnboardingDraftStore(
    (state) => state.setSelectedKeywords,
  );
  const setDraftPersonalities = useOnboardingDraftStore(
    (state) => state.setPersonalities,
  );
  const setDraftIdealPersonalities = useOnboardingDraftStore(
    (state) => state.setIdealPersonalities,
  );
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
  const [pendingAction, setPendingAction] = useState<
    "camera" | "gallery" | null
  >(null);

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

  const handleTakePhoto = () => {
    handleImageAction("camera");
  };

  const handlePickFromGallery = () => {
    handleImageAction("gallery");
  };

  // iOS는 액션시트 모달이 닫힌 뒤에 카메라/앨범을 띄워야 해서 pendingAction으로 미룬다.
  const handleImageAction = (action: "camera" | "gallery") => {
    setShowActionSheet(false);

    if (Platform.OS === "ios") {
      setPendingAction(action);
      return;
    }

    void runImageAction(action);
  };

  const onModalDismiss = async () => {
    const action = pendingAction;
    if (!action) return;

    setPendingAction(null);
    await runImageAction(action);
  };

  const runImageAction = async (action: "camera" | "gallery") => {
    try {
      if (action === "camera") {
        const hasPermission = await ensurePermission({
          getPermission: ImagePicker.getCameraPermissionsAsync,
          requestPermission: ImagePicker.requestCameraPermissionsAsync,
          title: "카메라 권한 필요",
          message: "설정에서 카메라 접근 권한을 허용해주세요.",
        });
        if (!hasPermission) return;
      }

      const result =
        action === "camera"
          ? await ImagePicker.launchCameraAsync({
              mediaTypes: ["images"],
              allowsEditing: false,
              quality: 0.85,
            })
          : await ImagePicker.launchImageLibraryAsync({
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
    setImageUri(DEFAULT_PROFILE_IMAGE_URI);
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
      let profileImageUrl: string | undefined;

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
      Alert.alert(
        "저장 실패",
        getApiErrorMessage(error) ?? "프로필을 다시 저장해주세요.",
      );
    }
  };

  const handleProfileVoicePress = () => {
    if (profile) {
      setDraftNickname(nickname.trim() || profile.nickname || "");
      if (typeof profile.age === "number" && profile.age > 0) {
        setDraftAge(profile.age);
      }
      if (profile.gender === "M" || profile.gender === "F") {
        setDraftGender(profile.gender);
      }
      if (profile.area?.code) {
        setDraftArea(profile.area.code, profile.area.name ?? "");
      }
      setDraftBirthDate(profile.birthDate ?? null);
      setDraftProfileImageUri(imageUri || profile.profileImageUrl || null);
      setDraftIntroText(introText.trim() || profile.introText || "");
      setDraftSelectedKeywords(profile.keywords ?? []);
      setDraftPersonalities(profile.personalities ?? []);
      setDraftIdealPersonalities(profile.idealPersonalities ?? []);
    }

    router.push("/profile/welcome" as never);
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
              {imageUri && imageUri !== DEFAULT_PROFILE_IMAGE_URI ? (
                <Image source={{ uri: imageUri }} style={styles.avatarImage} />
              ) : (
                <DefaultProfileAvatar size={118} />
              )}
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
            <Pressable
              style={styles.profileVoiceCardButton}
              onPress={handleProfileVoicePress}
            >
              <ProfileVoiceCard width="100%" height="100%" />
            </Pressable>
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
                onPress={handleTakePhoto}
              >
                <Text style={styles.modalOptionText}>카메라로 촬영</Text>
              </Pressable>
              <View style={styles.modalDivider} />
              <Pressable
                style={({ pressed }) => [
                  styles.modalOption,
                  pressed && styles.modalOptionPressed,
                ]}
                onPress={handlePickFromGallery}
              >
                <Text style={styles.modalOptionText}>앨범에서 선택</Text>
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
  const { uploadUrl, fileRef } = await postPresign({
    fileName: `profile-${Date.now()}.${extension}`,
    contentType,
    purpose: PROFILE_IMAGE_PURPOSE,
  });
  const fileResponse = await fetch(asset.uri);
  const blob = await fileResponse.blob();
  const uploadBlob = blob.type ? blob : new Blob([blob], { type: contentType });

  await uploadFileToS3(uploadUrl, uploadBlob, contentType);

  return fileRef;
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
  profileVoiceCardButton: {
    width: "100%",
    aspectRatio: 372 / 56,
    marginBottom: 12,
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
