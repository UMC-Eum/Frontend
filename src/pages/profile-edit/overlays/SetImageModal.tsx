import { useCallback, useRef, useState } from "react";
import { useUserStore } from "../../../stores/useUserStore";
import Cropper, { Area } from "react-easy-crop";
import getCroppedImg from "../../../utils/cropImage";
import { postPresign, uploadFileToS3 } from "../../../api/onboarding/onboardingApi";
import { updateMyProfile } from "../../../api/users/usersApi";

type SetImageModalProps = {
  onClose: () => void;
};

export default function SetImageModal({ onClose }: SetImageModalProps) {
  const [rawImageURL, setRawImageURL] = useState<string | null>(null);
  const { updateUser } = useUserStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isLoading, setIsLoading] = useState(false);

  const onUpload = () => {
    fileInputRef.current?.click(); //onChange 실행
  };

  //실제 작동하는 onChange
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    setRawImageURL(url);
    e.target.value = "";
  };

  const handleImageSave = async (imageUrl: string) => {
    setIsLoading(true);
    try {
      await updateMyProfile({
        profileImageUrl: imageUrl,
      });
      updateUser({ profileImageUrl: imageUrl });
      onClose();
    } catch (error) {
      console.error("Failed to update profile image:", error);
      alert("프로필 이미지 업데이트에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const onDefault = () => {
    const defaultUrl =
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee";
    handleImageSave(defaultUrl);
  };

  return (
    <>
      {!rawImageURL && (
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
                className={`w-full py-4 text-lg font-medium active:bg-gray-100 ${isLoading ? "text-gray-400" : ""}`}
                onClick={onUpload}
                disabled={isLoading}
              >
                {isLoading ? "처리 중..." : "촬영 또는 앨범에서 선택"}
              </button>
              <button
                className={`w-full py-4 text-lg font-medium active:bg-gray-100 ${isLoading ? "text-gray-400" : ""}`}
                onClick={onDefault}
                disabled={isLoading}
              >
                기본 프로필 선택
              </button>
            </div>
            <div className="bg-white text-center rounded-2xl overflow-hidden">
              <button
                className="w-full py-4 text-lg font-medium active:bg-gray-100"
                onClick={onClose}
                disabled={isLoading}
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 숨겨진 File Input (ref로 제어) */}
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Crop UI 창 */}
      {rawImageURL && (
        <ImageCropModal
          rawImageURL={rawImageURL}
          onClose={() => {
            setRawImageURL(null); // 크롭 취소 시
            onClose(); // 전체 모달 닫기
          }}
          onComplete={async (croppedImg) => {
            setIsLoading(true);
            try {
              // 1. DataURL(Base64)을 Blob 파일로 변환
              const response = await fetch(croppedImg);
              const blob = await response.blob();
              const file = new File([blob], `profile_${Date.now()}.jpg`, { type: "image/jpeg" });

              // 2. S3 Presigned URL 요청
              const presignResult = await postPresign({
                fileName: file.name,
                contentType: file.type,
                purpose: "profile-image",
              });

              const { uploadUrl, fileUrl } = presignResult.data;

              // 3. S3 직접 업로드
              await uploadFileToS3(uploadUrl, file);

              // 4. 서버 유저 정보 업데이트 (PATCH /v1/users/me)
              await handleImageSave(fileUrl);
            } catch (error) {
              console.error("Image upload failed:", error);
              alert("이미지 업로드 중 오류가 발생했습니다.");
            } finally {
              setIsLoading(false);
              setRawImageURL(null);
            }
          }}
        />
      )}
    </>
  );
}

type ImageCropModalProps = {
  rawImageURL: string;
  onClose: () => void;
  onComplete: (croppedImage: string) => void;
};

const ImageCropModal = ({
  rawImageURL,
  onClose,
  onComplete,
}: ImageCropModalProps) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const onCropComplete = useCallback(
    (_croppedArea: Area, croppedAreaPixels: Area) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    []
  );

  const handleCropSave = async () => {
    try {
      if (rawImageURL && croppedAreaPixels) {
        // 1. 유틸 함수를 통해 잘린 이미지 생성
        const croppedImage = await getCroppedImg(rawImageURL, croppedAreaPixels);
        
        // 2. 부모 컴포넌트로 결과 전달
        if (croppedImage) {
          onComplete(croppedImage);
        }
      }
    } catch (e) {
      console.error("Error cropping image:", e);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black">
      <Cropper
        image={rawImageURL}
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
        }}
      />
      <div className="absolute top-0 left-0 right-0 p-6 flex justify-between z-50 pointer-events-auto">
        <button onClick={onClose} className="text-white text-lg">
          취소
        </button>
        <button
          onClick={handleCropSave}
          className="text-white text-lg font-bold"
        >
          완료
        </button>
      </div>
    </div>
  );
};
