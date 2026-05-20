import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme/colors';

type Tone = 'error' | 'success' | 'info';

const toneMap = {
  error: {
    backgroundColor: colors.dangerSoft,
    borderColor: '#fecaca',
    textColor: colors.danger,
  },
  success: {
    backgroundColor: colors.successSoft,
    borderColor: '#a7f3d0',
    textColor: colors.success,
  },
  info: {
    backgroundColor: colors.primarySoft,
    borderColor: '#bfdbfe',
    textColor: colors.primary,
  },
};

const MessageBanner = ({ message, tone = 'info' }: { message: string; tone?: Tone }) => {
  const current = toneMap[tone];

  return (
    <View style={[styles.wrapper, { backgroundColor: current.backgroundColor, borderColor: current.borderColor }]}>
      <Text style={[styles.message, { color: current.textColor }]}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  message: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default MessageBanner;