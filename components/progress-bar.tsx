import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

type ProgressBarProps = {
  value: number;
  max?: number;
  height?: number;
  trackColor?: string;
  fillColor?: string;
  style?: StyleProp<ViewStyle>;
  trackStyle?: StyleProp<ViewStyle>;
};

export default function ProgressBar({
  value,
  max = 1,
  height = 4,
  trackColor = '#DEE3E5',
  fillColor = '#FF3E70',
  style,
  trackStyle,
}: ProgressBarProps) {
  const clampedMax = max > 0 ? max : 1;
  const ratio = Math.max(0, Math.min(1, value / clampedMax));

  return (
    <View style={style}>
      <View
        style={[
          styles.track,
          { height, backgroundColor: trackColor, borderRadius: height / 2 },
          trackStyle,
        ]}
      >
        <View
          style={[
            styles.fill,
            {
              width: `${ratio * 100}%`,
              backgroundColor: fillColor,
              borderRadius: height / 2,
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    width: '100%',
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
  },
});

