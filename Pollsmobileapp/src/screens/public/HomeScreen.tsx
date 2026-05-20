import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import Screen from '../../components/ui/Screen';
import Button from '../../components/ui/Button';
import type { PublicStackParamList } from '../../navigation/types';
import { colors } from '../../theme/colors';

type Props = NativeStackScreenProps<PublicStackParamList, 'Home'>;

const HomeScreen = ({ navigation }: Props) => (
  <Screen contentContainerStyle={styles.screenContent}>
    <View style={styles.hero}>
      <View style={styles.heroSheen} />

      <View style={styles.heroContent}>
        <View style={styles.logoWrap}>
          <Image source={require('../../assets/logo.png')} style={styles.logo} resizeMode="contain" />
        </View>

        <View style={styles.kickerRow}>
          <Text style={styles.kicker}>Classic mobile experience</Text>
        </View>

        <Text style={styles.heroTitle}>Poll Master</Text>

        <View style={styles.heroActions}>
          <Button label="Explore polls" onPress={() => navigation.navigate('PublicPolls')} />
          <Button label="Login" onPress={() => navigation.navigate('Login')} variant="secondary" />
        </View>
      </View>
    </View>
  </Screen>
);

const styles = StyleSheet.create({
  screenContent: {
    flexGrow: 1,
    justifyContent: 'center',
    backgroundColor: '#f8f5ef',
    paddingTop: 12,
    paddingBottom: 56,
  },
  hero: {
    backgroundColor: 'rgba(255,255,255,0.44)',
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.78)',
    paddingHorizontal: 24,
    paddingVertical: 28,
    shadowColor: '#78716c',
    shadowOpacity: 0.12,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 14 },
    elevation: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  heroSheen: {
    position: 'absolute',
    top: -20,
    left: -30,
    right: -30,
    height: 120,
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderRadius: 999,
  },
  heroContent: {
    gap: 18,
  },
  logoWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 4,
    paddingBottom: 8,
  },
  logo: {
    width: 120,
    height: 120,
  },
  kickerRow: {
    alignItems: 'center',
  },
  kicker: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: '#44403c',
  },
  heroTitle: {
    fontSize: 34,
    lineHeight: 40,
    fontWeight: '800',
    color: '#1c1917',
    textAlign: 'center',
  },
  heroActions: {
    gap: 10,
    marginTop: 8,
  },
});

export default HomeScreen;