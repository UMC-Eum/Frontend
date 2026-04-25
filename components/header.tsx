import React from 'react';
import { Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

type HeaderBaseProps = {
  title?: string;
  onPressBack?: () => void;
  rightIcon?: 'none' | 'bell' | 'kebab';
  rightText?: string;
  onPressRight?: () => void;
  hasAlarm?: boolean;
  titleAlign?: 'left' | 'center';
};

function HeaderBase({
  title,
  onPressBack,
  rightIcon = 'none',
  rightText,
  onPressRight,
  hasAlarm = false,
  titleAlign = 'left',
}: HeaderBaseProps) {
  const hasBack = !!onPressBack;
  const hasRight = rightIcon !== 'none' || !!rightText;

  const containerStyle: ViewStyle = {
    paddingLeft: hasBack ? 15 : 20,
    paddingRight: hasRight ? 32 : 20,
  };

  return (
    <View style={[styles.container, containerStyle]}>
      <View style={styles.leftSlot}>
        {hasBack && (
          <Pressable
            onPress={onPressBack}
            hitSlop={10}
            style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
          >
            <MaterialIcons name="chevron-left" size={18} color="#9AA3A8" />
          </Pressable>
        )}
      </View>

      <View style={styles.centerSlot} pointerEvents="none">
        {title && (
          <Text
            numberOfLines={1}
            style={[
              styles.title,
              titleAlign === 'center' ? styles.titleCenter : styles.titleLeft,
              hasBack && titleAlign === 'left' ? styles.titleWithBack : null,
            ]}
          >
            {title}
          </Text>
        )}
      </View>

      <View style={styles.rightSlot}>
        {rightText ? (
          <Pressable
            onPress={onPressRight}
            hitSlop={10}
            style={({ pressed }) => [pressed && styles.pressed]}
          >
            <Text style={styles.rightText}>{rightText}</Text>
          </Pressable>
        ) : rightIcon !== 'none' ? (
          <Pressable
            onPress={onPressRight}
            hitSlop={10}
            style={({ pressed }) => [styles.rightButton, pressed && styles.pressed]}
          >
            <View style={styles.rightIconWrap}>
              {rightIcon === 'bell' ? (
                <MaterialIcons name="notifications-none" size={24} color="#2B2B2B" />
              ) : (
                <MaterialIcons name="more-vert" size={24} color="#2B2B2B" />
              )}
            </View>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

// 1) back + bell (알람 dot 옵션)
export function Header1(props: {
  title?: string;
  onPressBack: () => void;
  onPressBell?: () => void;
  hasAlarm?: boolean;
}) {
  return (
    <HeaderBase
      title={props.title}
      onPressBack={props.onPressBack}
      rightIcon="bell"
      onPressRight={props.onPressBell}
      hasAlarm={props.hasAlarm}
      titleAlign="left"
    />
  );
}

// 2) back + 왼쪽 타이틀 + kebab
export function Header2(props: {
  title: string;
  onPressBack: () => void;
  onPressMenu?: () => void;
}) {
  return (
    <HeaderBase
      title={props.title}
      onPressBack={props.onPressBack}
      rightIcon="kebab"
      onPressRight={props.onPressMenu}
      titleAlign="left"
    />
  );
}

// 3) back + 가운데 타이틀 + kebab
export function Header3(props: {
  title: string;
  onPressBack: () => void;
  onPressMenu?: () => void;
}) {
  return (
    <HeaderBase
      title={props.title}
      onPressBack={props.onPressBack}
      rightIcon="kebab"
      onPressRight={props.onPressMenu}
      titleAlign="center"
    />
  );
}

// 4) no-back + 왼쪽 타이틀 + kebab
export function Header4(props: {
  title: string;
  onPressMenu?: () => void;
}) {
  return (
    <HeaderBase
      title={props.title}
      rightIcon="kebab"
      onPressRight={props.onPressMenu}
      titleAlign="left"
    />
  );
}

// 5) 왼쪽 타이틀 + 오른쪽 텍스트
export function Header5(props: {
  title: string;
  rightText: string;
  onPressRight?: () => void;
}) {
  return (
    <HeaderBase
      title={props.title}
      rightText={props.rightText}
      onPressRight={props.onPressRight}
      titleAlign="left"
    />
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
  },
  leftSlot: {
    minWidth: 18,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  backButton: {
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerSlot: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  titleLeft: {
    textAlign: 'left',
  },
  titleCenter: {
    textAlign: 'center',
  },
  titleWithBack: {
    marginLeft: 15,
  },
  rightSlot: {
    minWidth: 24,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  rightButton: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightIconWrap: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  pressed: {
    opacity: 0.6,
  },
});
