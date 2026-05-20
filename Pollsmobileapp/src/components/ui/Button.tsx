import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, type StyleProp, type ViewStyle } from 'react-native';
import { colors } from '../../theme/colors';

type Variant = 'primary' | 'secondary' | 'danger';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: Variant;
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
}

const Button = ({ label, onPress, variant = 'primary', disabled, loading, style }: ButtonProps) => {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.button,
        variantStyles[variant].button,
        isDisabled && styles.disabled,
        pressed && !isDisabled && styles.pressed,
        style,
      ]}
    >
      {loading ? <ActivityIndicator color={variantStyles[variant].text.color} /> : <Text style={[styles.label, variantStyles[variant].text]}>{label}</Text>}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    minHeight: 48,
    borderRadius: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 15,
    fontWeight: '700',
  },
  disabled: {
    opacity: 0.55,
  },
  pressed: {
    transform: [{ scale: 0.99 }],
  },
});

const variantStyles = {
  primary: StyleSheet.create({
    button: {
      backgroundColor: colors.primary,
    },
    text: {
      color: '#ffffff',
    },
  }),
  secondary: StyleSheet.create({
    button: {
      backgroundColor: colors.surfaceMuted,
      borderWidth: 1,
      borderColor: colors.border,
    },
    text: {
      color: colors.text,
    },
  }),
  danger: StyleSheet.create({
    button: {
      backgroundColor: colors.danger,
    },
    text: {
      color: '#ffffff',
    },
  }),
};

export default Button;