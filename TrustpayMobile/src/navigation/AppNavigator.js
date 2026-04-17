import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Feather } from '@expo/vector-icons';

import { useAuth } from '../context/AuthContext';

// Auth Screens
import LoginScreen from '../screens/auth/LoginScreen';
import OnboardingScreen from '../screens/auth/OnboardingScreen';
import SelectPlanScreen from '../screens/auth/SelectPlanScreen';

// Main Screens
import DashboardScreen from '../screens/main/DashboardScreen';
import TransactionsScreen from '../screens/main/TransactionsScreen';
import TransactionDetailScreen from '../screens/main/TransactionDetailScreen';
import NewTransactionScreen from '../screens/main/NewTransactionScreen';
import PaymentsScreen from '../screens/main/PaymentsScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import EditProfileScreen from '../screens/main/EditProfileScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// ── Auth Stack ─────────────────────────────────────────────────────────────────
function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
    </Stack.Navigator>
  );
}

// ── Onboarding Stack ───────────────────────────────────────────────────────────
function OnboardingStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
    </Stack.Navigator>
  );
}

// ── Home Stack (Dashboard + New Transaction + Transaction Detail) ──────────────
function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Dashboard" component={DashboardScreen} />
      <Stack.Screen name="NewTransaction" component={NewTransactionScreen} />
      <Stack.Screen name="TransactionDetail" component={TransactionDetailScreen} />
    </Stack.Navigator>
  );
}

// ── Transactions Stack ─────────────────────────────────────────────────────────
function TransactionsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="TransactionsList" component={TransactionsScreen} />
      <Stack.Screen name="TransactionDetail" component={TransactionDetailScreen} />
    </Stack.Navigator>
  );
}

// ── Profile Stack ──────────────────────────────────────────────────────────────
function ProfileStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProfileMain" component={ProfileScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
    </Stack.Navigator>
  );
}

// ── Main Tab Navigator ─────────────────────────────────────────────────────────
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#0a0a0f',
          borderTopColor: 'rgba(255,255,255,0.08)',
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: '#6366f1',
        tabBarInactiveTintColor: '#64748b',
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600', marginTop: 2 },
        tabBarIcon: ({ color, size }) => {
          const icons = {
            Home: 'home',
            Transactions: 'list',
            Payments: 'credit-card',
            Profile: 'user',
          };
          return <Feather name={icons[route.name] || 'circle'} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeStack} />
      <Tab.Screen name="Transactions" component={TransactionsStack} />
      <Tab.Screen name="Payments" component={PaymentsScreen} />
      <Tab.Screen name="Profile" component={ProfileStack} />
    </Tab.Navigator>
  );
}

// ── Root Navigator ─────────────────────────────────────────────────────────────
export default function AppNavigator() {
  const { user, isLoadingAuth, isAuthenticated, onboardingDone, isLoadingOnboarding } = useAuth();

  // Show spinner while auth or onboarding state is loading
  if (isLoadingAuth || isLoadingOnboarding) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  // Onboarding has not been seen yet — show it before anything else
  if (!onboardingDone) {
    return <OnboardingStack />;
  }

  // Onboarding done but not authenticated → show auth screens
  if (!isAuthenticated) {
    return <AuthStack />;
  }

  // Authenticated but no plan selected yet
  if (!user?.plan) {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="SelectPlan" component={SelectPlanScreen} />
      </Stack.Navigator>
    );
  }

  // Fully set up → Main App
  return <MainTabs />;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0a0a0f',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
