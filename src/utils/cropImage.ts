// src/utils/cropImage.ts

export const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    // CORS 문제 방지 (외부 이미지 사용 시 필요)
    image.setAttribute("crossOrigin", "anonymous");
    image.src = url;
  });

export function getRadianAngle(degreeValue: number) {
  return (degreeValue * Math.PI) / 180;
}

/**
 * 이미지와 크롭 영역을 받아 'Base64 문자열'로 반환합니다.
 * (새로고침 해도 로컬스토리지에서 유지되도록 수정됨)
 */
export default async function getCroppedImg(
  imageSrc: string,
  pixelCrop: { x: number; y: number; width: number; height: number },
  rotation = 0
): Promise<string | null> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    return null;
  }

  const maxSize = Math.max(image.width, image.height);
  const safeArea = 2 * ((maxSize / 2) * Math.sqrt(2));

  // 회전 시 이미지가 잘리지 않도록 캔버스 크기를 넉넉하게 잡음
  canvas.width = safeArea;
  canvas.height = safeArea;

  // 캔버스 중심 이동 및 회전
  ctx.translate(safeArea / 2, safeArea / 2);
  ctx.rotate(getRadianAngle(rotation));
  ctx.translate(-safeArea / 2, -safeArea / 2);

  // 이미지 그리기
  ctx.drawImage(
    image,
    safeArea / 2 - image.width * 0.5,
    safeArea / 2 - image.height * 0.5
  );

  const data = ctx.getImageData(0, 0, safeArea, safeArea);

  // 최종 크롭 사이즈로 캔버스 크기 조정
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  // 잘라낸 이미지 데이터 붙여넣기
  ctx.putImageData(
    data,
    Math.round(0 - safeArea / 2 + image.width * 0.5 - pixelCrop.x),
    Math.round(0 - safeArea / 2 + image.height * 0.5 - pixelCrop.y)
  );

  // ✅ 핵심 변경 사항: Blob 대신 Base64 문자열(DataURL) 반환
  // 이렇게 하면 새로고침해도 로컬 스토리지에 이미지가 유지됩니다.
  return canvas.toDataURL("image/jpeg");
}
