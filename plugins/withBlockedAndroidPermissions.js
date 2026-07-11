const { AndroidConfig } = require("expo/config-plugins");

// 라이브러리가 자동으로 넣는 미사용 Android 권한을 최종 매니페스트에서 제거한다.
// - SYSTEM_ALERT_WINDOW: 사용 안 함(RN 디버그 매니페스트 잔재)
// - FOREGROUND_SERVICE_MEDIA_PLAYBACK: expo-audio가 선언하지만 백그라운드 재생을
//   쓰지 않으므로(인앱 재생만) 불필요. Play Console 권한 소명/영상 제출을 피한다.
// ponytail: 향후 백그라운드 오디오를 추가하면 아래 목록에서 미디어 권한을 빼야 한다.
module.exports = (config) =>
  AndroidConfig.Permissions.withBlockedPermissions(config, [
    "android.permission.SYSTEM_ALERT_WINDOW",
    "android.permission.FOREGROUND_SERVICE_MEDIA_PLAYBACK",
  ]);
