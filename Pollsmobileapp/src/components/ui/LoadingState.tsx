import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme/colors';

const LoadingState = ({ label = 'Loading...' }: { label?: string }) => (
  <View style={styles.wrapper}>
    <ActivityIndicator size="large" color={colors.primary} />
    <Text style={styles.label}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  wrapper: {
    paddingVertical: 32,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  label: {
    fontSize: 14,
    color: colors.textMuted,
  },
});

export default LoadingState;