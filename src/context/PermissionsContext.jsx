import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { permissionsService } from '../services/permissionsService';
import { useAuth } from './AuthContext';

const PermissionsContext = createContext(null);

export const PermissionsProvider = ({ children }) => {
  const { authenticated, roles } = useAuth();
  const [permissions, setPermissions] = useState({
    permissions: [],
    modules: [],
    roles: [],
    loading: true,
    error: null,
  });

  /**
   * Carga los permisos del usuario desde el backend
   */
  const loadPermissions = useCallback(async (forceRefresh = false) => {
    if (!authenticated) {
      setPermissions({
        permissions: [],
        modules: [],
        roles: [],
        loading: false,
        error: null,
      });
      return;
    }

    try {
      setPermissions(prev => ({ ...prev, loading: true, error: null }));
      
      const data = await permissionsService.getPermissions(forceRefresh);
      
      setPermissions({
        permissions: data.permissions || [],
        modules: data.modules || [],
        roles: data.roles || roles || [],
        loading: false,
        error: null,
      });
    } catch (error) {
      console.error('Error al cargar permisos:', error);
      
      // En caso de error, intentar usar permisos del caché
      const cached = permissionsService.getPermissionsFromStorage();
      if (cached) {
        setPermissions({
          permissions: cached.permissions || [],
          modules: cached.modules || [],
          roles: cached.roles || roles || [],
          loading: false,
          error: 'Usando permisos en caché',
        });
      } else {
        setPermissions({
          permissions: [],
          modules: [],
          roles: roles || [],
          loading: false,
          error: 'Error al cargar permisos',
        });
      }
    }
  }, [authenticated, roles]);

  /**
   * Cargar permisos al autenticarse
   */
  useEffect(() => {
    if (authenticated) {
      loadPermissions();
    } else {
      // Limpiar permisos al cerrar sesión
      permissionsService.clearPermissions();
      setPermissions({
        permissions: [],
        modules: [],
        roles: [],
        loading: false,
        error: null,
      });
    }
  }, [authenticated]);

  /**
   * Verifica si el usuario tiene un permiso específico
   * @param {string} permission - Permiso en formato "module.action"
   * @returns {boolean}
   */
  const hasPermission = useCallback((permission) => {
    if (!permission) return false;
    return permissions.permissions.includes(permission);
  }, [permissions.permissions]);

  /**
   * Verifica si el usuario tiene alguno de los permisos especificados
   * @param {string[]} requiredPermissions - Array de permisos
   * @returns {boolean}
   */
  const hasAnyPermission = useCallback((requiredPermissions) => {
    if (!requiredPermissions || requiredPermissions.length === 0) return false;
    return requiredPermissions.some(perm => permissions.permissions.includes(perm));
  }, [permissions.permissions]);

  /**
   * Verifica si el usuario tiene todos los permisos especificados
   * @param {string[]} requiredPermissions - Array de permisos
   * @returns {boolean}
   */
  const hasAllPermissions = useCallback((requiredPermissions) => {
    if (!requiredPermissions || requiredPermissions.length === 0) return false;
    return requiredPermissions.every(perm => permissions.permissions.includes(perm));
  }, [permissions.permissions]);

  /**
   * Verifica si el usuario tiene acceso a un módulo
   * @param {string} module - Nombre del módulo
   * @returns {boolean}
   */
  const hasModuleAccess = useCallback((module) => {
    if (!module) return false;
    return permissions.modules.includes(module);
  }, [permissions.modules]);

  /**
   * Verifica si el usuario puede realizar una acción en un módulo
   * @param {string} module - Nombre del módulo
   * @param {string} action - Acción a verificar
   * @returns {boolean}
   */
  const canPerformAction = useCallback((module, action) => {
    const permission = `${module}.${action}`;
    return hasPermission(permission);
  }, [hasPermission]);

  /**
   * Refresca los permisos desde el backend
   */
  const refreshPermissions = useCallback(() => {
    return loadPermissions(true);
  }, [loadPermissions]);

  const value = useMemo(() => ({
    permissions: permissions.permissions,
    modules: permissions.modules,
    roles: permissions.roles,
    loading: permissions.loading,
    error: permissions.error,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasModuleAccess,
    canPerformAction,
    refreshPermissions,
  }), [
    permissions,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasModuleAccess,
    canPerformAction,
    refreshPermissions,
  ]);

  return (
    <PermissionsContext.Provider value={value}>
      {children}
    </PermissionsContext.Provider>
  );
};

export const usePermissions = () => {
  const context = useContext(PermissionsContext);
  if (!context) {
    throw new Error('usePermissions debe usarse dentro de PermissionsProvider');
  }
  return context;
};
