import {
  Image as ExpoImage,
  ImageBackground as ExpoImageBackground,
} from "expo-image";
import type { ImageBackgroundProps, ImageProps } from "expo-image";

// 앱의 모든 원격 이미지에 메모리+디스크 캐시를 기본 적용하는 공용 래퍼.
// expo-image 기본값(disk)과 달리 memory-disk는 재표시 시 디코딩 없이 즉시 뜬다.
// 개별 화면에서 cachePolicy를 넘기면 그 값이 우선한다.
export function Image(props: ImageProps) {
  return <ExpoImage cachePolicy="memory-disk" {...props} />;
}

export function ImageBackground(props: ImageBackgroundProps) {
  return <ExpoImageBackground cachePolicy="memory-disk" {...props} />;
}
