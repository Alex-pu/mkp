import React from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';
import { colors } from '../../theme/colors';

interface ToggleRowProps {
  label: string;
  description?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
}

const ToggleRow = ({ label, description, value, onValueChange, disabled }: ToggleRowProps) => (
  <View style={[styles.row, disabled && styles.disabled]}>
    <View style={styles.copy}>
      <Text style={styles.label}>{label}</Text>
      {description ? <Text style={styles.description}>{description}</Text> : null}
    </View>
    <Switch
      value={value}
      onValueChange={onValueChange}
      disabled={disabled}
      trackColor={{ false: '#cbd5e1', true: '#93c5fd' }}
      thumbColor={value ? colors.primary : '#ffffff'}
    />
  </View>
);

const styles = StyleSheet.create({
  row: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    backgroundColor: colors.surface,
  },
  copy: {
    flex: 1,
    gap: 4,
  },
  label: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  description: {
    fontSize: 13,
    lineHeight: 19,
    color: colors.textMuted,
  },
  disabled: {
    opacity: 0.55,
  },
});

export default ToggleRow;