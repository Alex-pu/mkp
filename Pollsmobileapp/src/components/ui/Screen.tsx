import React from 'react';
import { ScrollView, StyleSheet, Text, View, type ScrollViewProps, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../theme/colors';

interface ScreenProps extends ScrollViewProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  contentContainerStyle?: ViewStyle;
}

const Screen = ({ title, subtitle, children, contentContainerStyle, ...props }: ScreenProps) => (
  <SafeAreaView style={styles.safeArea} edges={[ 'top' ]}>
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={[styles.content, contentContainerStyle]}
      keyboardShouldPersistTaps="handled"
      {...props}
    >
      {title ? (
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
      ) : null}
      {children}
    </ScrollView>
  </SafeAreaView>
);

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 16,
    gap: 16,
    paddingBottom: 32,
  },
  header: {
    gap: 6,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.textMuted,
  },
});

export default Screen;