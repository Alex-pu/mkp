import React from 'react';
import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';
import { colors } from '../../theme/colors';

interface InputProps extends TextInputProps {
  label: string;
  error?: string;
}

const Input = ({ label, error, style, ...props }: InputProps) => (
  <View style={styles.wrapper}>
    <Text style={styles.label}>{label}</Text>
    <TextInput
      placeholderTextColor={colors.textMuted}
      style={[styles.input, props.multiline && styles.multiline, style]}
      {...props}
    />
    {error ? <Text style={styles.error}>{error}</Text> : null}
  </View>
);

const styles = StyleSheet.create({
  wrapper: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  input: {
    minHeight: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.text,
  },
  multiline: {
    minHeight: 110,
    textAlignVertical: 'top',
  },
  error: {
    color: colors.danger,
    fontSize: 13,
  },
});

export default Input;