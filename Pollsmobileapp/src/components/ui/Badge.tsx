import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme/colors';

type Tone = 'default' | 'success' | 'danger' | 'info';

const toneStyles = {
  default: { backgroundColor: colors.surfaceMuted, color: colors.text },
  success: { backgroundColor: colors.successSoft, color: colors.success },
  danger: { backgroundColor: colors.dangerSoft, color: colors.danger },
  info: { backgroundColor: colors.primarySoft, color: colors.primary },
};

const Badge = ({ label, tone = 'default' }: { label: string; tone?: Tone }) => (
  <View style={[styles.badge, { backgroundColor: toneStyles[tone].backgroundColor }]}>
    <Text style={[styles.label, { color: toneStyles[tone].color }]}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
  },
});

export default Badge;