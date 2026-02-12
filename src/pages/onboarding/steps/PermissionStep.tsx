import { useEffect, useState } from "react";
import { useMediaStore } from "../../../stores/useMediaStore";
import { PERMISSION_CONFIG } from "../../../constants/permissions";

// 이미지 import (경로는 그대로 유지)
import cameraimg from "../../../assets/permission_camera.svg";
import bellimg from "../../../assets/permission_bell.svg";
import micimg from "../../../assets/permission_mic.svg";
import { FullButton } from "../../../components/standard/CTA";

const permissionIcons: Record<string, string> = {
  camera: cameraimg,
  notification: bellimg,
  microphone: micimg,
};

interface Props {
  onFinish: () => void;
}

export default function PermissionStep({ onFinish }: Props) {
  // 1. 미디어 스토어 가져오기
  const { permission: mediaPermission, requestStream } = useMediaStore();

  // 2. 알림 권한 상태 (로컬 상태로 관리)
  const [notiPermission, setNotiPermission] =
    useState<NotificationPermission>("default");

  // 3. UI에 보여줄 상태 계산 (Record<string, boolean>)
  // mediaPermission이 'granted'면 카메라/마이크 둘 다 true로 처리
  const permissionsState = {
    camera: mediaPermission === "granted",
    microphone: mediaPermission === "granted", // 보통 웹에선 카메라 켤 때 마이크도 같이 켬
    notification: notiPermission === "granted",
  };

  // 초기 마운트 시 알림 권한 확인
  useEffect(() => {
    if ("Notification" in window) {
      setNotiPermission(Notification.permission);
    }
  }, []);

  // 4. 토글 핸들러 (실제 권한 요청)
  const handleToggle = async (key: string) => {
    // 이미 허용되어 있으면 반응 안 함 (끄는 건 브라우저 설정에서만 가능하므로)
    if (permissionsState[key as keyof typeof permissionsState]) return;

    if (key === "camera" || key === "microphone") {
      // 카메라/마이크는 useMediaStore를 통해 요청
      await requestStream();
    } else if (key === "notification") {
      // 알림 권한 요청
      if (!("Notification" in window)) {
        alert("이 브라우저는 알림을 지원하지 않습니다.");
        return;
      }
      const result = await Notification.requestPermission();
      setNotiPermission(result);
    }
  };

  // 5. 확인 버튼 핸들러
  const handleFinish = () => {
    // 필수 권한(카메라)이 없는 경우 경고
    if (!permissionsState.camera) {
      alert("원활한 서비스 이용을 위해 카메라는 필수입니다! 😭");
      // return; // 강제하고 싶으면 주석 해제
    }
    onFinish();
  };

  return (
    <div className="flex flex-col h-full bg-white px-6 pt-10 pb-[58px]">
      <h1 className="text-2xl font-bold text-center mb-5">앱 접근 권한 안내</h1>

      <p className="text-[20px] font-semibold text-center text-gray-900 mb-8 leading-relaxed">
        원활한 서비스 이용을 위해
        <br />
        다음 권한 허용이 필요합니다.
      </p>

      {/* 권한 리스트 */}
      <div className="space-y-3 flex-1">
        {Object.entries(permissionsState).map(([key, isGranted]) => (
          <div
            key={key}
            onClick={() => handleToggle(key)}
            className={`
              flex items-center gap-4 rounded-xl p-4 cursor-pointer
              transition-all duration-200 border
              ${
                isGranted
                  ? "bg-pink-50 border-pink-200 shadow-sm"
                  : "bg-gray-50 border-transparent hover:bg-gray-100"
              }
            `}
          >
            {/* 아이콘 */}
            <div
              className={`
              w-12 h-12 rounded-full flex items-center justify-center transition-colors
              ${isGranted ? "bg-pink-100" : "bg-white border border-gray-200"}
            `}
            >
              <img src={permissionIcons[key]} alt={key} className="w-6 h-6" />
            </div>

            {/* 텍스트 영역 */}
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p
                  className={`text-[17px] font-bold ${isGranted ? "text-gray-900" : "text-gray-600"}`}
                >
                  {PERMISSION_CONFIG[key].label}
                </p>
                {(key === "camera" || key === "microphone") && (
                  <span className="text-xs text-[#fc3367] font-bold bg-pink-100 px-1.5 py-0.5 rounded">
                    필수
                  </span>
                )}
              </div>
              <p className="text-[14px] text-gray-500 mt-0.5">
                {PERMISSION_CONFIG[key].desc}
              </p>
            </div>

            {/* 체크박스 UI */}
            <div
              className={`
              w-6 h-6 rounded-full flex items-center justify-center border-2
              ${isGranted ? "border-[#fc3367] bg-[#fc3367]" : "border-gray-300"}
            `}
            >
              {isGranted && (
                <span className="text-white text-xs font-bold">✔</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* 확인 버튼 */}
      <FullButton
        onClick={handleFinish}
        disabled={!permissionsState.camera}
      >
        확인
      </FullButton>
    </div>
  );
}
