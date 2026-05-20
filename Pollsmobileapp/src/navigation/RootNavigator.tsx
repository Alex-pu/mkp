import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../hooks/useAuth';
import LoadingState from '../components/ui/LoadingState';
import HomeScreen from '../screens/public/HomeScreen';
import LoginScreen from '../screens/public/LoginScreen';
import PublicPollsScreen from '../screens/public/PublicPollsScreen';
import PublicVoteScreen from '../screens/public/PublicVoteScreen';
import DashboardScreen from '../screens/app/DashboardScreen';
import PollsScreen from '../screens/app/PollsScreen';
import PollFormScreen from '../screens/app/PollFormScreen';
import AnalyticsScreen from '../screens/app/AnalyticsScreen';
import AssignedPollsScreen from '../screens/app/AssignedPollsScreen';
import AssignedVoteScreen from '../screens/app/AssignedVoteScreen';
import ReportsScreen from '../screens/app/ReportsScreen';
import UsersScreen from '../screens/app/UsersScreen';
import type { AppStackParamList, AppTabParamList, PublicStackParamList } from './types';
import { colors } from '../theme/colors';

const PublicStack = createNativeStackNavigator<PublicStackParamList>();
const AppStack = createNativeStackNavigator<AppStackParamList>();
const Tabs = createBottomTabNavigator<AppTabParamList>();

const tabConfig: Record<AppTabParamList extends infer T ? keyof T : never, { label: string; icon: keyof typeof Ionicons.glyphMap }> = {
  Dashboard: { label: 'Home', icon: 'home' },
  Polls: { label: 'Polls', icon: 'bar-chart' },
  Assigned: { label: 'Assigned', icon: 'checkmark-circle' },
  Reports: { label: 'Reports', icon: 'document-text' },
  Users: { label: 'Users', icon: 'people' },
};

const renderTabIcon = (routeName: keyof AppTabParamList, focused: boolean) => {
  const config = tabConfig[routeName];

  return (
    <View style={styles.tabItem}>
      <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
        <Ionicons
          name={config.icon}
          size={20}
          color={focused ? colors.primary : colors.textMuted}
        />
      </View>
      <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>{config.label}</Text>
    </View>
  );
};

const AppTabs = () => {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  return (
    <Tabs.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: '#eef2f7',
          borderTopWidth: 1,
          height: 76,
          paddingTop: 10,
          paddingBottom: 12,
          paddingHorizontal: 8,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarItemStyle: {
          paddingVertical: 2,
        },
      }}
    >
      <Tabs.Screen name="Dashboard" component={DashboardScreen} options={{ tabBarIcon: ({ focused }) => renderTabIcon('Dashboard', focused) }} />
      <Tabs.Screen name="Polls" component={PollsScreen} options={{ tabBarIcon: ({ focused }) => renderTabIcon('Polls', focused) }} />
      <Tabs.Screen name="Assigned" component={AssignedPollsScreen} options={{ tabBarIcon: ({ focused }) => renderTabIcon('Assigned', focused) }} />
      <Tabs.Screen name="Reports" component={ReportsScreen} options={{ tabBarIcon: ({ focused }) => renderTabIcon('Reports', focused) }} />
      {isSuperAdmin ? <Tabs.Screen name="Users" component={UsersScreen} options={{ tabBarIcon: ({ focused }) => renderTabIcon('Users', focused) }} /> : null}
    </Tabs.Navigator>
  );
};

const AuthenticatedNavigator = () => (
  <AppStack.Navigator>
    <AppStack.Screen name="MainTabs" component={AppTabs} options={{ headerShown: false }} />
    <AppStack.Screen name="PollForm" component={PollFormScreen} options={{ title: 'Poll editor' }} />
    <AppStack.Screen name="Analytics" component={AnalyticsScreen} options={{ title: 'Analytics' }} />
    <AppStack.Screen name="AssignedVote" component={AssignedVoteScreen} options={{ title: 'Assigned poll' }} />
    <AppStack.Screen name="PublicPolls" component={PublicPollsScreen} options={{ title: 'Public polls' }} />
    <AppStack.Screen name="PublicVote" component={PublicVoteScreen} options={{ title: 'Vote' }} />
  </AppStack.Navigator>
);

const PublicNavigator = () => (
  <PublicStack.Navigator>
    <PublicStack.Screen name="Home" component={HomeScreen} options={{ title: 'Poll Master' }} />
    <PublicStack.Screen name="Login" component={LoginScreen} options={{ title: 'Login' }} />
    <PublicStack.Screen name="PublicPolls" component={PublicPollsScreen} options={{ title: 'Public polls' }} />
    <PublicStack.Screen name="PublicVote" component={PublicVoteScreen} options={{ title: 'Vote' }} />
  </PublicStack.Navigator>
);

const RootNavigator = () => {
  const { hasHydrated, isAuthenticated } = useAuth();

  if (!hasHydrated) {
    return <LoadingState label="Loading session..." />;
  }

  return isAuthenticated ? <AuthenticatedNavigator /> : <PublicNavigator />;
};

const styles = StyleSheet.create({
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    minWidth: 58,
  },
  iconWrap: {
    minWidth: 42,
    height: 30,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapActive: {
    backgroundColor: colors.primarySoft,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textMuted,
  },
  tabLabelActive: {
    color: colors.primary,
    fontWeight: '700',
  },
});

export default RootNavigator;