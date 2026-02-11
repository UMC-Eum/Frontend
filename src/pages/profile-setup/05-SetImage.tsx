import { useState, useRef, useCallback } from "react";
import Cropper from "react-easy-crop";
import { useUserStore } from "../../stores/useUserStore";
import getCroppedImg from "../../utils/cropImage";
import avatar_placeholder from "../../assets/avatar_placeholder.png";
import camera_btn from "../../assets/camera_btn.png";
import { FullButton } from "../../components/standard/CTA";
import { postPresign } from "../../api/onboarding/onboardingApi";

interface SetImageProps {
  onNext: () => void;
}

export default function SetImage({ onNext }: SetImageProps) {
  // ----------------------------------------------------------------
  // State 정의
  // ----------------------------------------------------------------
  // 1. 최종 화면에 보여질(그리고 저장될) 이미지 URL
  const [imageSrc, setImageSrc] = useState("");

  // 2. 모달 상태 관리
  const [isMenuOpen, setIsMenuOpen] = useState(false); // 하단 메뉴 (촬영/기본)
  const [isCroppingOpen, setIsCroppingOpen] = useState(false); // 크롭 화면

  // 3. 크롭핑 관련 상태 (react-easy-crop용)
  const [rawImage, setRawImage] = useState<string | null>(null); // 파일 선택 직후 원본
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  // 4. 스토어 및 Refs
  const { updateUser } = useUserStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ----------------------------------------------------------------
  // 핸들러 함수들
  // ----------------------------------------------------------------

  // [1] 파일이 선택되었을 때 -> 원본 저장 & 크롭 모달 열기
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 파일을 읽어서 Blob URL 생성
    const url = URL.createObjectURL(file);
    setRawImage(url);
    setIsCroppingOpen(true);

    // 같은 파일을 다시 선택할 수 있도록 input 초기화
    e.target.value = "";
  };

  // [2] 크롭 영역이 변경될 때마다 좌표 기록 (라이브러리가 호출해줌)
  const onCropComplete = useCallback(
    (_croppedArea: any, croppedAreaPixels: any) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    []
  );

  // [3] '자르기 완료' 버튼 클릭 시 -> 실제 이미지 자르고 저장
  const handleCropSave = async () => {
    if (!rawImage || !croppedAreaPixels) return;

    try {
      // 유틸 함수로 이미지 자르기
      const croppedImage = await getCroppedImg(rawImage, croppedAreaPixels);

      if (croppedImage) {
        // 최종 상태 업데이트
        setImageSrc(croppedImage);
        // 스토어에 저장
        updateUser({ profileImageUrl: croppedImage });

        const presignData = await postPresign({
          fileName: croppedImage,
          contentType: "image/png",
          purpose: "PROFILE_INTRO_AUDIO"
        });
      }


    } catch (e) {
      console.error("Crop error:", e);
    } finally {
      // 정리 작업
      setIsCroppingOpen(false);
      setRawImage(null);
      setZoom(1);
    }
  };

  // [4] 하단 모달에서 '촬영/앨범' 클릭 시 -> 숨겨진 input 클릭
  const triggerFileInput = () => {
    setIsMenuOpen(false);
    // 모달 닫힘 애니메이션과 겹치지 않게 살짝 딜레이
    setTimeout(() => {
      fileInputRef.current?.click();
    }, 100);
  };

  // [5] 하단 모달에서 '기본 프로필' 클릭 시
  const handleDefaultProfile = () => {
    const defaultUrl =
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee";
    setImageSrc(defaultUrl);
    updateUser({ profileImageUrl: defaultUrl });
    setIsMenuOpen(false);
  };

  // 유효성 검사 (이미지가 있어야 다음으로 넘어감)
  const isValid = imageSrc.length > 0;

  return (
    <div className="flex-1 flex flex-col justify-between">
      <h1 className="text-[26px] font-bold text-black leading-tight">
        사진을 등록해주세요.
      </h1>
      <p className="text-gray-500 text-[15px] mt-2">
        따뜻한 미소가 담긴 사진은 매칭에 큰 도움이 됩니다.
      </p>

      <div className="flex flex-col items-center justify-center mt-[106px]">
        <div
          className={`relative w-40 h-40 rounded-full p-[3px] ${
            isValid
              ? "bg-gradient-to-tr from-[#FFBD66] v ia-[#FF3D77] to-[#FF3D77]"
              : "bg-gray-300"
          } flex items-center justify-center`}
        >
          {/* 이미지 표시 */}
          <div className="w-full h-full rounded-full overflow-hidden bg-white">
            <img
              src={isValid ? imageSrc : avatar_placeholder}
              className="w-full h-full object-cover"
              alt="Profile"
            />
          </div>

          {/* 카메라 버튼 (메뉴 열기) */}
          <button
            onClick={() => setIsMenuOpen(true)}
            className="absolute -bottom-1 -right-1 flex items-center justify-center"
          >
            <img src={camera_btn} alt="Change" />
          </button>
        </div>
      </div>

      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />

      {/* 빈 공간을 다 차지해서 버튼을 아래로 밀어버림 */}
      <div className="flex-1" />

      <FullButton onClick={onNext} disabled={!isValid}>
        다음
      </FullButton>

      {/* -------------------------------------------------- */}
      {/* 하단 메뉴 모달 (SetImageModal) */}
      {/* -------------------------------------------------- */}
      {isMenuOpen && (
        <SetImageModal
          onClose={() => setIsMenuOpen(false)}
          onUpload={triggerFileInput}
          onDefault={handleDefaultProfile}
        />
      )}

      {/* -------------------------------------------------- */}
      {/* 전체화면 크롭 모달 */}
      {/* -------------------------------------------------- */}
      {/* ✅ 크롭 UI 모달 (전체 화면 덮기) */}
      {isCroppingOpen && rawImage && (
        <div className="fixed inset-0 z-[9999] bg-black">
          {/* 1. 크롭 영역을 화면 전체(inset-0)로 설정 */}
          <div className="absolute inset-0">
            <Cropper
              image={rawImage}
              crop={crop}
              zoom={zoom}
              aspect={1}
              cropShape="round"
              showGrid={false}
              onCropChange={setCrop}
              onCropComplete={onCropComplete}
              onZoomChange={setZoom}
              // 배경색을 검정으로 설정 (이미지가 없는 빈 공간)
              style={{
                containerStyle: { backgroundColor: "#000" },
                mediaStyle: {},
                cropAreaStyle: {},
              }}
            />
          </div>

          {/* 2. 버튼들을 'absolute'로 띄워서 배치 (배경 없이) */}
          {/* 상단 안전 영역(safe-area) 고려하여 padding-top 넉넉히 줌 */}
          <div className="absolute top-0 left-0 right-0 px-6 py-8 flex justify-between z-50 pointer-events-none">
            {/* 취소 버튼 */}
            <button
              onClick={() => {
                setIsCroppingOpen(false);
                setRawImage(null);
              }}
              // pointer-events-auto: 부모가 none이라도 클릭 가능하게 함
              // drop-shadow: 사진이 밝을 때 글자가 안 보일 수 있으므로 그림자 추가
              className="text-lg font-medium text-white drop-shadow-md pointer-events-auto"
            >
              취소
            </button>

            {/* 완료 버튼 */}
            <button
              onClick={handleCropSave}
              className="text-lg font-medium text-white drop-shadow-md pointer-events-auto"
            >
              완료
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ----------------------------------------------------------------
// 하단 메뉴 모달 컴포넌트
// ----------------------------------------------------------------
type SetImageModalProps = {
  onClose: () => void;
  onUpload: () => void;
  onDefault: () => void;
};

function SetImageModal({ onClose, onUpload, onDefault }: SetImageModalProps) {
  return (
    <div
      className="px-10 pb-4 fixed inset-0 bg-black/50 flex items-end justify-center z-50"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md flex flex-col gap-4 animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-white text-center rounded-2xl divide-y-2 divide-gray-100 overflow-hidden">
          <button
            className="w-full py-4 text-lg font-medium active:bg-gray-100"
            onClick={onUpload}
          >
            촬영 또는 앨범에서 선택
          </button>
          <button
            className="w-full py-4 text-lg font-medium active:bg-gray-100"
            onClick={onDefault}
          >
            기본 프로필 선택
          </button>
        </div>
        <div className="bg-white text-center rounded-2xl overflow-hidden">
          <button
            className="w-full py-4 text-lg font-medium active:bg-gray-100"
            onClick={onClose}
          >
            취소
          </button>
        </div>
      </div>
    </div>
  );
}
