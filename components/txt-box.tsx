import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';

interface TxtBoxProps extends TextInputProps {
  supportingText?: string;
  onClear?: () => void;
}

export default function TxtBox({
  supportingText,
  value,
  onChangeText,
  onClear,
  ...props
}: TxtBoxProps) {
  const [isFocused, setIsFocused] = useState(false);

  const handleClear = () => {
    onChangeText?.('');
    onClear?.();
  };

  const isActive = isFocused || !!supportingText;
  const showClear = isFocused && !!value;

  return (
    <View style={styles.container}>
      <View style={[styles.inputContainer, isActive && styles.inputContainerActive]}>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholderTextColor="#C4C4C4"
          {...props}
        />
        {showClear && (
          <Pressable onPress={handleClear} style={styles.clearButton}>
            <View style={styles.clearCircle}>
              <Text style={styles.clearIcon}>✕</Text>
            </View>
          </Pressable>
        )}
      </View>
      {supportingText && (
        <Text style={styles.supportingText}>{supportingText}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 62,
    borderWidth: 2,
    borderRadius: 14,
    borderColor: '#DEE3E5',
    paddingHorizontal: 20,
    gap: 10,
    backgroundColor: '#FFFFFF',
  },
  inputContainerActive: {
    borderColor: '#FF3E70',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1A1A1A',
    height: '100%',
  },
  clearButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#DEE3E5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearIcon: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '600',
    lineHeight: 14,
  },
  supportingText: {
    marginTop: 7,
    fontSize: 14,
    fontWeight: '500',
    color: '#FF3E70',
  },
});
