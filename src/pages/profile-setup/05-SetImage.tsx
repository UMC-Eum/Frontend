import { useState, useRef, useCallback } from "react";
import Cropper from "react-easy-crop";
import { useUserStore } from "../../stores/useUserStore";
import getCroppedImg from "../../utils/cropImage";
import avatar_placeholder from "../../assets/avatar_placeholder.svg";
import camera_btn from "../../assets/camera_btn.png";
import { FullButton } from "../../components/standard/CTA";

interface SetImageProps {
  onNext: () => void;
}

export default function SetImage({ onNext }: SetImageProps) {
  const [imageSrc, setImageSrc] = useState("");

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCroppingOpen, setIsCroppingOpen] = useState(false);

  const [rawImage, setRawImage] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const { user, updateUser } = useUserStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    setRawImage(url);
    setIsCroppingOpen(true);

    e.target.value = "";
  };

  const onCropComplete = useCallback(
    (_croppedArea: any, croppedAreaPixels: any) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    [],
  );

  const handleCropSave = async () => {
    if (!rawImage || !croppedAreaPixels) return;

    try {
      const croppedImage = await getCroppedImg(rawImage, croppedAreaPixels);

      if (croppedImage) {
        setImageSrc(croppedImage);
        updateUser({ profileImageUrl: croppedImage });
      }
    } catch (e) {
      console.error("Crop error:", e);
    } finally {
      setIsCroppingOpen(false);
      setRawImage(null);
      setZoom(1);
    }
  };

  const triggerFileInput = () => {
    setIsMenuOpen(false);
    setTimeout(() => {
      fileInputRef.current?.click();
    }, 100);
  };

  const handleDefaultProfile = () => {
    const defaultUrl = avatar_placeholder;
    setImageSrc(defaultUrl);
    updateUser({ profileImageUrl: defaultUrl });
    setIsMenuOpen(false);
  };

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
          <div className="w-full h-full rounded-full overflow-hidden bg-white">
            <img
              src={isValid ? imageSrc : avatar_placeholder}
              className="w-full h-full object-cover"
              alt="Profile"
            />
          </div>

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

      <div className="flex-1" />

      <FullButton onClick={onNext} disabled={!isValid}>
        다음
      </FullButton>

      {isMenuOpen && (
        <SetImageModal
          onClose={() => setIsMenuOpen(false)}
          onUpload={triggerFileInput}
          onDefault={handleDefaultProfile}
        />
      )}

      {isCroppingOpen && rawImage && (
        <div className="fixed inset-0 z-[9999] bg-black">
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
              style={{
                containerStyle: { backgroundColor: "#000" },
                mediaStyle: {},
                cropAreaStyle: {},
              }}
            />
          </div>

          <div className="absolute top-0 left-0 right-0 px-6 py-8 flex justify-between z-50 pointer-events-none">
            <button
              onClick={() => {
                setIsCroppingOpen(false);
                setRawImage(null);
              }}
              className="text-lg font-medium text-white drop-shadow-md pointer-events-auto"
            >
              취소
            </button>

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
