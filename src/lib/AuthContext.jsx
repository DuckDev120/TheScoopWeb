import React, { createContext, useState, useContext, useEffect } from 'react';

console.log('--- AUTH CONTEXT LOADED (VERSION 2 - NEUTRALIZED) ---');

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState({ id: 'dummy-user', name: 'Admin' });
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [isLoadingAuth, setIsLoadingAuth] = useState(false);
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [appPublicSettings, setAppPublicSettings] = useState({});

  const checkAppState = async () => {
    setIsLoadingAuth(false);
    setIsLoadingPublicSettings(false);
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
  };

  const navigateToLogin = () => {
    console.log('Navigate to login');
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated, 
      isLoadingAuth,
      isLoadingPublicSettings,
      authError,
      appPublicSettings,
      logout,
      navigateToLogin,
      checkAppState
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
