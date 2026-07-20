import Svg, { Circle, Path } from "react-native-svg";

type DefaultProfileAvatarProps = {
  size: number;
};

export default function DefaultProfileAvatar({ size }: DefaultProfileAvatarProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 200 200">
      <Circle cx="100" cy="100" r="100" fill="#DEE3E5" />
      <Circle cx="100" cy="81" r="30" fill="#F8FAFB" />
      <Path
        d="M36 178C46 136 70 124 100 124C130 124 154 136 164 178C147 192 125 200 100 200C75 200 53 192 36 178Z"
        fill="#F8FAFB"
      />
    </Svg>
  );
}
