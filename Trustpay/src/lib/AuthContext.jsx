import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import apiClient, { getToken, setToken, removeToken } from '@/api/apiClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [authError, setAuthError] = useState(null);

  // On mount: check for Supabase email-confirmation hash first, then validate token
  useEffect(() => {
    const hash = window.location.hash;
    if (hash && hash.length > 1) {
      const params = new URLSearchParams(hash.substring(1));
      const token = params.get('access_token');
      const errorCode = params.get('error_code');
      const errorDesc = params.get('error_description');

      // Clean the hash from the URL regardless of outcome
      window.history.replaceState(null, '', window.location.pathname);

      if (token) {
        // Successful email confirmation — store token and proceed
        setToken(token);
      } else if (errorCode) {
        // Email link error (expired, already used, etc.)
        const friendly =
          errorCode === 'otp_expired'
            ? 'Your confirmation link has expired. Please register again to get a new link.'
            : errorDesc?.replace(/\+/g, ' ') || 'The confirmation link is invalid. Please try again.';
        setIsLoadingAuth(false);
        setAuthError({ type: 'link_error', message: friendly });
        return;
      }
    }
    checkUserAuth();
  }, []);

  const checkUserAuth = useCallback(async () => {
    setIsLoadingAuth(true);
    setAuthError(null);

    const token = getToken();
    if (!token) {
      setIsAuthenticated(false);
      setIsLoadingAuth(false);
      setAuthError({ type: 'auth_required', message: 'Please sign in' });
      return;
    }

    try {
      const currentUser = await apiClient.auth.me();
      setUser(currentUser);
      setIsAuthenticated(true);
    } catch (error) {
      removeToken();
      setIsAuthenticated(false);
      setAuthError({ type: 'auth_required', message: 'Session expired. Please sign in again.' });
    } finally {
      setIsLoadingAuth(false);
    }
  }, []);

  const login = async (email, password) => {
    const data = await apiClient.auth.login(email, password);
    setUser(data.user);
    setIsAuthenticated(true);
    setAuthError(null);
    return data;
  };

  // Called after OTP verification — sets user directly without a page reload
  const loginWithToken = (token, userData) => {
    setToken(token);
    setUser(userData);
    setIsAuthenticated(true);
    setAuthError(null);
  };

  const register = async (email, password, full_name) => {
    return apiClient.auth.register(email, password, full_name);
  };

  const logout = async () => {
    try {
      await apiClient.auth.logout();
    } finally {
      removeToken();
      setUser(null);
      setIsAuthenticated(false);
      setAuthError({ type: 'auth_required', message: 'Signed out' });
    }
  };

  const updateUser = async (updates) => {
    const updated = await apiClient.auth.updateMe(updates);
    setUser(updated);
    return updated;
  };

  // Kept for compatibility with existing components that call navigateToLogin
  const navigateToLogin = () => {
    setAuthError({ type: 'auth_required', message: 'Please sign in' });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoadingAuth,
        // Compatibility: some pages reference isLoadingPublicSettings
        isLoadingPublicSettings: false,
        authError,
        appPublicSettings: null,
        login,
        loginWithToken,
        register,
        logout,
        updateUser,
        navigateToLogin,
        checkAppState: checkUserAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
