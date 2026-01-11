// pages/onboarding/steps/PermissionStep.tsx
import cameraimg from "../../../assets/permission_camera.svg"
import bellimg from "../../../assets/permission_bell.svg"
import micimg from "../../../assets/permission_mic.svg"
const permissionIcons: Record<string, string> = {
  camera: cameraimg,
  notification: bellimg,
  microphone: micimg,
}


interface Props {
  permissions: Record<string, boolean>
  onToggle: (key: string) => void
  onFinish: () => void
}

export default function PermissionStep({
  permissions,
  onToggle,
  onFinish,
}: Props) {
  return (
    <div className="flex flex-col min-h-screen bg-white px-6 pt-10">
      <h1 className="text-2xl font-bold text-center mb-5">
        앱 접근 권한 안내
      </h1>

      <p className="text-[20px] text-semibold text-center text-gray-900 mb-8">
        원활한 서비스 이용을 위해
        <br />
        다음 권한 허용이 필요합니다.
      </p>

      {/* 권한 리스트 */}
      <div className="space-y-3 flex-1">
        {Object.entries(permissions).map(([key, value]) => (
          <div
            key={key}
            onClick={() => onToggle(key)}
            className={`
              flex items-center gap-4 rounded-xl p-4 cursor-pointer
              transition
              ${value ? "bg-pink-100" : "bg-gray-100"}
            `}
          >
            {/* 아이콘 자리 */}
            <div className="w-10 h-10 rounded-full text-gray-900 flex items-center justify-center">
              <img
                src={permissionIcons[key]}
                alt={key}
                className="w-6 h-6"
              />
            </div>
            <div className="flex-1">
              <p className="text-[18px] text-gray-900 font-semibold">{key}</p>
              <p className="text-[16px] text-gray-700">
                권한 설명이 들어갈 영역
              </p>
            </div>

            {/* 선택 여부 표시 */}
            {value && (
              <span className="text-[#fc3367] font-bold">
                ✔
              </span>
            )}
          </div>
        ))}
      </div>

      {/* 확인 버튼 */}
      <button
        onClick={onFinish}
        className="h-14 bg-[#fc3367] text-white rounded-xl mb-6"
      >
        확인
      </button>
    </div>
  )
}
