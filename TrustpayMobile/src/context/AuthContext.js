import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi, getToken, setToken, removeToken, setRefreshToken } from '../api/apiClient';

const ONBOARDING_KEY = 'escrow_onboarding_done';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [onboardingDone, setOnboardingDoneState] = useState(false);
  const [isLoadingOnboarding, setIsLoadingOnboarding] = useState(true);

  const isAuthenticated = !!user;

  const loadOnboardingState = useCallback(async () => {
    setIsLoadingOnboarding(true);
    try {
      const val = await AsyncStorage.getItem(ONBOARDING_KEY);
      setOnboardingDoneState(val === 'true');
    } catch {
      setOnboardingDoneState(false);
    } finally {
      setIsLoadingOnboarding(false);
    }
  }, []);

  const setOnboardingDone = useCallback(async () => {
    await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
    setOnboardingDoneState(true);
  }, []);

  const checkAppState = useCallback(async () => {
    setIsLoadingAuth(true);
    try {
      // Always load onboarding state regardless of auth status
      await loadOnboardingState();
      const token = await getToken();
      if (!token) {
        setUser(null);
        return;
      }
      const userData = await authApi.getMe();
      setUser(userData);
    } catch (e) {
      await removeToken();
      setUser(null);
    } finally {
      setIsLoadingAuth(false);
    }
  }, [loadOnboardingState]);

  useEffect(() => {
    checkAppState();
  }, [checkAppState]);

  const login = async (email, password) => {
    const data = await authApi.login({ email, password });
    if (data.access_token) {
      await setToken(data.access_token);
      if (data.refresh_token) await setRefreshToken(data.refresh_token);
    }
    if (data.user) {
      setUser(data.user);
    } else {
      const userData = await authApi.getMe();
      setUser(userData);
    }
    return data;
  };

  const register = async (full_name, email, password, username) => {
    const payload = { full_name, email, password };
    if (username) payload.username = username;
    const data = await authApi.register(payload);
    if (data.access_token) {
      await setToken(data.access_token);
      if (data.refresh_token) await setRefreshToken(data.refresh_token);
    }
    if (data.user) {
      setUser(data.user);
    } else if (!data.requires_verification) {
      const userData = await authApi.getMe();
      setUser(userData);
    }
    return data;
  };

  const logout = async () => {
    await removeToken();
    setUser(null);
    // Do not reset onboardingDone — onboarding is shown before auth and should persist
  };

  const updateUser = useCallback(async (data) => {
    const updated = await authApi.updateMe(data);
    if (updated) {
      setUser((prev) => ({ ...prev, ...updated }));
    }
    return updated;
  }, []);

  const loginWithToken = useCallback(async (token) => {
    await setToken(token);
    try {
      const userData = await authApi.getMe();
      setUser(userData);
      return userData;
    } catch (e) {
      await removeToken();
      throw e;
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoadingAuth,
        onboardingDone,
        isLoadingOnboarding,
        setOnboardingDone,
        login,
        register,
        logout,
        updateUser,
        loginWithToken,
        checkAppState,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
