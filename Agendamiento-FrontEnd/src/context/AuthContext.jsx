import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState({ username: '', authenticated: false });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    const token = localStorage.getItem('jwt');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUser({ username: payload.username || payload.user_id, authenticated: true });
      } catch (e) {
        setUser({ username: '', authenticated: false });
      }
    } else {
      setUser({ username: '', authenticated: false });
    }
    setLoading(false);
  };

  const login = (token) => {
    localStorage.setItem('jwt', token);
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      setUser({ username: payload.username || payload.user_id, authenticated: true });
    } catch (e) {
      setUser({ username: '', authenticated: false });
    }
  };

  const logout = () => {
    localStorage.removeItem('jwt');
    localStorage.removeItem('refresh_token');
    setUser({ username: '', authenticated: false });
  };

  return (
    <AuthContext.Provider value={{ ...user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
};
