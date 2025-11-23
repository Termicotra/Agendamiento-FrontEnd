import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { getUserInfoFromToken, isTokenExpired } from '../utils/jwt';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState({ 
    username: '', 
    authenticated: false, 
    roles: [],
    userId: null,
    email: '',
    first_name: '',
    last_name: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    const token = localStorage.getItem('jwt');
    if (token) {
      try {
        if (isTokenExpired(token)) {
          logout();
          return;
        }

        const userInfo = getUserInfoFromToken(token);
        const storedUser = authService.getCurrentUser();
        
        setUser({ 
          username: userInfo.username, 
          authenticated: true,
          roles: userInfo.roles,
          userId: userInfo.userId,
          email: userInfo.email || storedUser?.email || '',
          first_name: storedUser?.first_name || '',
          last_name: storedUser?.last_name || ''
        });
      } catch {
        setUser({ 
          username: '', 
          authenticated: false, 
          roles: [], 
          userId: null,
          email: '',
          first_name: '',
          last_name: ''
        });
      }
    } else {
      setUser({ 
        username: '', 
        authenticated: false, 
        roles: [], 
        userId: null,
        email: '',
        first_name: '',
        last_name: ''
      });
    }
    setLoading(false);
  };

  const login = (token, userData = null) => {
    localStorage.setItem('jwt', token);
    try {
      const userInfo = getUserInfoFromToken(token);
      
      const completeUserData = {
        username: userInfo.username,
        authenticated: true,
        roles: userInfo.roles,
        userId: userInfo.userId,
        email: userInfo.email || userData?.email || '',
        first_name: userData?.first_name || '',
        last_name: userData?.last_name || ''
      };
      
      if (userInfo.roles && userInfo.roles.length > 0) {
        localStorage.setItem('user_roles', JSON.stringify(userInfo.roles));
      }
      
      setUser(completeUserData);
    } catch {
      setUser({ 
        username: '', 
        authenticated: false, 
        roles: [], 
        userId: null,
        email: '',
        first_name: '',
        last_name: ''
      });
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      setUser({ 
        username: '', 
        authenticated: false, 
        roles: [], 
        userId: null,
        email: '',
        first_name: '',
        last_name: ''
      });
    }
  };

  /**
   * Verifica si el usuario tiene un rol específico
   * @param {string} role - Nombre del rol a verificar
   * @returns {boolean}
   */
  const hasRole = (role) => {
    return user.roles.includes(role);
  };

  /**
   * Verifica si el usuario tiene alguno de los roles especificados
   * @param {string[]} roles - Array de roles
   * @returns {boolean}
   */
  const hasAnyRole = (roles) => {
    if (!roles || roles.length === 0) return false;
    return roles.some(role => user.roles.includes(role));
  };

  const value = useMemo(() => ({ 
    ...user, 
    login, 
    logout, 
    loading,
    hasRole,
    hasAnyRole
  }), [user, loading]);

  return (
    <AuthContext.Provider value={value}>
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

