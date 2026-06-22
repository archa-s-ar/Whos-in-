import React, { createContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('whos_in_token'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Validate token and fetch user on load
  useEffect(() => {
    const bootstrapAuth = async () => {
      const storedToken = localStorage.getItem('whos_in_token');
      if (storedToken) {
        try {
          const res = await authAPI.getMe();
          if (res.data && res.data.success) {
            setUser(res.data.user);
            localStorage.setItem('whos_in_user', JSON.stringify(res.data.user));
          } else {
            handleLogout();
          }
        } catch (err) {
          console.error('Failed to validate token:', err);
          handleLogout();
        }
      }
      setLoading(false);
    };

    bootstrapAuth();
  }, []);

  const handleLogin = async (email, password) => {
    setError(null);
    setLoading(true);
    try {
      const res = await authAPI.login({ email, password });
      if (res.data && res.data.success) {
        const { token: userToken, user: userData } = res.data;
        setToken(userToken);
        setUser(userData);
        localStorage.setItem('whos_in_token', userToken);
        localStorage.setItem('whos_in_user', JSON.stringify(userData));
        setLoading(false);
        return { success: true };
      }
      setLoading(false);
      return { success: false, message: 'Login failed' };
    } catch (err) {
      setLoading(false);
      const msg = err.response?.data?.message || 'Login failed. Please check credentials.';
      setError(msg);
      return { success: false, message: msg };
    }
  };

  const handleRegister = async (profileData) => {
    setError(null);
    setLoading(true);
    try {
      const res = await authAPI.register(profileData);
      if (res.data && res.data.success) {
        const { token: userToken, user: userData } = res.data;
        setToken(userToken);
        setUser(userData);
        localStorage.setItem('whos_in_token', userToken);
        localStorage.setItem('whos_in_user', JSON.stringify(userData));
        setLoading(false);
        return { success: true };
      }
      setLoading(false);
      return { success: false, message: 'Registration failed' };
    } catch (err) {
      setLoading(false);
      const msg = err.response?.data?.message || 'Registration failed. Please check your details.';
      setError(msg);
      return { success: false, message: msg };
    }
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('whos_in_token');
    localStorage.removeItem('whos_in_user');
  };

  const handleUpdateProfile = async (profileData) => {
    setError(null);
    try {
      const res = await authAPI.updateProfile(profileData);
      if (res.data && res.data.success) {
        const updatedUser = res.data.user;
        setUser(updatedUser);
        localStorage.setItem('whos_in_user', JSON.stringify(updatedUser));
        return { success: true };
      }
      return { success: false, message: 'Failed to update profile' };
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update profile';
      setError(msg);
      return { success: false, message: msg };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        error,
        login: handleLogin,
        register: handleRegister,
        logout: handleLogout,
        updateProfile: handleUpdateProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
