import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi, getToken, setToken, removeToken, setRefreshToken } from '../api/apiClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [onboardingDone, setOnboardingDoneState] = useState(false);
  const isLoadingOnboarding = false;

  const isAuthenticated = !!user;

  const setOnboardingDone = useCallback(() => {
    setOnboardingDoneState(true);
  }, []);

  const checkAppState = useCallback(async () => {
    setIsLoadingAuth(true);
    try {
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
  }, []);

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
    setOnboardingDoneState(false);
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
