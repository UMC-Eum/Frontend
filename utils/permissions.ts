import { Alert, Linking } from "react-native";

type PermissionResult = {
  granted: boolean;
  canAskAgain: boolean;
};

type EnsurePermissionOptions = {
  getPermission: () => Promise<PermissionResult>;
  requestPermission: () => Promise<PermissionResult>;
  title: string;
  message: string;
};

export async function ensurePermission({
  getPermission,
  requestPermission,
  title,
  message,
}: EnsurePermissionOptions): Promise<boolean> {
  const current = await getPermission();
  if (current.granted) return true;

  if (current.canAskAgain) {
    return (await requestPermission()).granted;
  }

  Alert.alert(title, message, [
    { text: "취소", style: "cancel" },
    {
      text: "설정 열기",
      onPress: () => {
        void Linking.openSettings();
      },
    },
  ]);
  return false;
}
