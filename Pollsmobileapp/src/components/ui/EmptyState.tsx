import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme/colors';

interface EmptyStateProps {
  title: string;
  description: string;
}

const EmptyState = ({ title, description }: EmptyStateProps) => (
  <View style={styles.wrapper}>
    <Text style={styles.title}>{title}</Text>
    <Text style={styles.description}>{description}</Text>
  </View>
);

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: 18,
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  description: {
    fontSize: 14,
    lineHeight: 21,
    color: colors.textMuted,
  },
});

export default EmptyState;