import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { colors } from '../../theme/colors';

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

const Card = ({ children, style }: CardProps) => <View style={[styles.card, style]}>{children}</View>;

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    gap: 12,
  },
});

export default Card;