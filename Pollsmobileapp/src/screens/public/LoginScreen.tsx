import React, { useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import Screen from '../../components/ui/Screen';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import MessageBanner from '../../components/ui/MessageBanner';
import { authService } from '../../services/authService';
import { useAuth } from '../../hooks/useAuth';
import type { PublicStackParamList } from '../../navigation/types';
import { colors } from '../../theme/colors';

type Props = NativeStackScreenProps<PublicStackParamList, 'Login'>;

const LoginScreen = ({ navigation: _navigation }: Props) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await authService.login({ email, password });
      login(response.user, response.token);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen contentContainerStyle={styles.screenContent}>
      <Text style={styles.title}>Login</Text>
      <Card style={styles.card}>
        {error ? <MessageBanner message={error} tone="error" /> : null}
        <Input label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" placeholder="admin@example.com" />
        <Input label="Password" value={password} onChangeText={setPassword} secureTextEntry placeholder="••••••••" />
        <Button label="Login" onPress={handleLogin} loading={loading} />
      </Card>
    </Screen>
  );
};

const styles = StyleSheet.create({
  screenContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingTop: 12,
    paddingBottom: 64,
  },
  title: {
    textAlign: 'center',
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
  },
  card: {
    alignSelf: 'stretch',
  },
});

export default LoginScreen;