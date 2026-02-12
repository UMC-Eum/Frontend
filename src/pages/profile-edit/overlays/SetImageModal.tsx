import { useCallback, useRef, useState } from "react";
import { useUserStore } from "../../../stores/useUserStore";
import Cropper, { Area } from "react-easy-crop";
import getCroppedImg from "../../../utils/cropImage";
import {
  postPresign,
  uploadFileToS3,
} from "../../../api/onboarding/onboardingApi";
import { updateMyProfile } from "../../../api/users/usersApi";
import avatar_placeholder from "../../../assets/avatar_placeholder.svg";
import { ERROR_SITUATION_MAP } from "../../../constants/errorConstants";
import ErrorPage from "../../ErrorPage";
import { ApiErrorDetail } from "../../../types/api/api";

type SetImageModalProps = {
  onClose: () => void;
};

export default function SetImageModal({ onClose }: SetImageModalProps) {
  const [rawImageURL, setRawImageURL] = useState<string | null>(null);
  const { updateUser } = useUserStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ApiErrorDetail | null>(null);
  if (error) {
    return <ErrorPage error={error} />;
  }

  const onUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    setRawImageURL(url);
    e.target.value = "";
  };

  const processAndUpload = async (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      setError({
        code: "VALID-001",
        message: "파일 크기가 너무 큽니다. (10MB 이하만 가능)",
      });
      return;
    }

    setIsLoading(true);
    try {
      let presignResult;
      try {
        presignResult = await postPresign({
          fileName: file.name,
          contentType: file.type,
          purpose: "PROFILE_IMAGE",
        });
      } catch (err) {
        console.error("Presign error:", err);
        throw { code: "SYS-002", message: "이미지 업로드 준비 실패" };
      }

      const { uploadUrl, fileUrl } = presignResult.data;

      try {
        await uploadFileToS3(uploadUrl, file);
      } catch (err) {
        console.error("S3 Upload error:", err);
        throw { code: "SYS-002", message: "이미지 저장 실패" };
      }

      try {
        await updateMyProfile({
          profileImageUrl: fileUrl,
        });
        updateUser({ profileImageUrl: fileUrl });
      } catch (err) {
        console.error("Profile update error:", err);
        throw { code: "AUTH-007", message: "프로필 업데이트 실패" };
      }

      onClose();
    } catch (err: any) {
      console.error("Global Catch Error:", err);

      const serverCode = err.response?.data?.error?.code;
      const serverMsg = err.response?.data?.error?.message;

      if (serverCode && ERROR_SITUATION_MAP[serverCode]) {
        setError({
          code: serverCode,
          message: serverMsg || ERROR_SITUATION_MAP[serverCode],
        });
      } else if (err.code && err.message) {
        setError(err);
      } else {
        setError({
          code: "UNKNOWN",
          message: "알 수 없는 오류가 발생했습니다.",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const onDefault = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(avatar_placeholder);
      const blob = await response.blob();
      const file = new File([blob], "default_profile.svg", {
        type: "image/svg+xml",
      });

      await processAndUpload(file);
    } catch (error) {
      console.error("Default image processing failed:", error);
      setError({
        code: "SYS-001",
        message: "기본 이미지를 불러오는데 실패했습니다.",
      });
      setIsLoading(false);
    }
  };

  return (
    <>
      {!rawImageURL && (
        <div
          className="px-10 pb-4 fixed inset-0 bg-black/50 flex items-end justify-center z-[100]"
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

      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />

      {rawImageURL && (
        <ImageCropModal
          rawImageURL={rawImageURL}
          onClose={() => {
            setRawImageURL(null);
            onClose();
          }}
          onComplete={async (croppedImg) => {
            try {
              const response = await fetch(croppedImg);
              const blob = await response.blob();
              const file = new File([blob], `profile_${Date.now()}.jpg`, {
                type: "image/jpeg",
              });

              await processAndUpload(file);
            } catch (e) {
              console.error("Crop conversion failed:", e);
              setError({
                code: "UNKNOWN",
                message: "이미지 처리에 실패했습니다.",
              });
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
    [],
  );

  const handleCropSave = async () => {
    try {
      if (rawImageURL && croppedAreaPixels) {
        const croppedImage = await getCroppedImg(
          rawImageURL,
          croppedAreaPixels,
        );

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
