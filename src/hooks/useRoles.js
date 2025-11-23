import { useAuth } from '../context/AuthContext';

/**
 * Hook personalizado para gestionar y verificar roles de usuario
 */
export const useRoles = () => {
  const { roles } = useAuth();

  /**
   * Verifica si el usuario tiene un rol específico
   * @param {string} role - El rol a verificar
   * @returns {boolean} - true si el usuario tiene el rol
   */
  const hasRole = (role) => {
    if (!roles || roles.length === 0) return false;
    return roles.includes(role);
  };

  /**
   * Verifica si el usuario tiene alguno de los roles especificados
   * @param {array} requiredRoles - Array de roles a verificar
   * @returns {boolean} - true si el usuario tiene al menos uno de los roles
   */
  const hasAnyRole = (requiredRoles) => {
    if (!roles || roles.length === 0 || !requiredRoles || requiredRoles.length === 0) {
      return false;
    }
    return requiredRoles.some(role => roles.includes(role));
  };

  /**
   * Verifica si el usuario tiene todos los roles especificados
   * @param {array} requiredRoles - Array de roles a verificar
   * @returns {boolean} - true si el usuario tiene todos los roles
   */
  const hasAllRoles = (requiredRoles) => {
    if (!roles || roles.length === 0 || !requiredRoles || requiredRoles.length === 0) {
      return false;
    }
    return requiredRoles.every(role => roles.includes(role));
  };

  /**
   * Obtiene los roles del usuario desde localStorage
   * @returns {array} - Array de roles
   */
  const getRolesFromStorage = () => {
    try {
      const storedRoles = localStorage.getItem('user_roles');
      return storedRoles ? JSON.parse(storedRoles) : [];
    } catch {
      return [];
    }
  };

  return {
    roles,
    hasRole,
    hasAnyRole,
    hasAllRoles,
    getRolesFromStorage,
  };
};
