import { useEffect, useState } from "react";
import { useMediaStore } from "../../../stores/useMediaStore";
import { PERMISSION_CONFIG } from "../../../constants/permissions";

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
  const { permission: mediaPermission, requestStream } = useMediaStore();

  const [notiPermission, setNotiPermission] =
    useState<NotificationPermission>("default");

  const permissionsState = {
    camera: mediaPermission === "granted",
    microphone: mediaPermission === "granted",
    notification: notiPermission === "granted",
  };

  useEffect(() => {
    if ("Notification" in window) {
      setNotiPermission(Notification.permission);
    }
  }, []);

  const handleToggle = async (key: string) => {
    if (permissionsState[key as keyof typeof permissionsState]) return;

    if (key === "camera" || key === "microphone") {
      await requestStream();
    } else if (key === "notification") {
      if (!("Notification" in window)) {
        alert("이 브라우저는 알림을 지원하지 않습니다.");
        return;
      }
      const result = await Notification.requestPermission();
      setNotiPermission(result);
    }
  };

  const handleFinish = () => {
    if (!permissionsState.camera) {
      alert("원활한 서비스 이용을 위해 카메라는 필수입니다!");
    }
    onFinish();
  };

  return (
    <div className="flex flex-col h-full bg-white px-6 pt-10 pb-[28px]">
      <h1 className="text-2xl font-bold text-center mb-5">앱 접근 권한 안내</h1>

      <p className="text-[20px] font-semibold text-center text-gray-900 mb-8 leading-relaxed">
        원활한 서비스 이용을 위해
        <br />
        다음 권한 허용이 필요합니다.
      </p>

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
            <div
              className={`
              w-12 h-12 rounded-full flex items-center justify-center transition-colors
              ${isGranted ? "bg-pink-100" : "bg-white border border-gray-200"}
            `}
            >
              <img src={permissionIcons[key]} alt={key} className="w-6 h-6" />
            </div>

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

      <FullButton onClick={handleFinish} disabled={!permissionsState.camera}>
        확인
      </FullButton>
    </div>
  );
}
