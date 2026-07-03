import { Image as RNImage } from "react-native";

export const DEFAULT_PROFILE_IMAGE_ASSET = require("@/assets/images/default-profile.png");
export const DEFAULT_PROFILE_IMAGE_URI = RNImage.resolveAssetSource(
  DEFAULT_PROFILE_IMAGE_ASSET,
).uri;
