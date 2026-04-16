import { createContext, useState, useContext, useEffect } from 'react';
import adminApi, { getToken, setToken, removeToken } from '@/api/apiClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  useEffect(() => {
    checkUserAuth();
  }, []);

  const checkUserAuth = async () => {
    setIsLoadingAuth(true);
    const token = getToken();
    if (!token) {
      setUser(null);
      setIsAuthenticated(false);
      setIsLoadingAuth(false);
      return;
    }
    try {
      const profile = await adminApi.getMe();
      if (profile && (profile.role === 'admin' || profile.role === 'view_only')) {
        setUser(profile);
        setIsAuthenticated(true);
      } else {
        // Authenticated but not an admin — clear session
        removeToken();
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (err) {
      removeToken();
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const login = async (email, password) => {
    const result = await adminApi.login({ email, password });
    if (!result.access_token) {
      throw new Error('No access token returned');
    }
    setToken(result.access_token);
    const profile = await adminApi.getMe();
    if (!profile || (profile.role !== 'admin' && profile.role !== 'view_only')) {
      removeToken();
      throw new Error('Access denied: admin role required');
    }
    setUser(profile);
    setIsAuthenticated(true);
    return profile;
  };

  const logout = () => {
    removeToken();
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isLoadingAuth,
      login,
      logout,
    }}>
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
