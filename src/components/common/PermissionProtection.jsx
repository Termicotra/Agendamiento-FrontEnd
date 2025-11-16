import React from 'react';
import { Navigate } from 'react-router-dom';
import { usePermissions } from '../../context/PermissionsContext';
import { Box, Typography, Paper, CircularProgress } from '@mui/material';
import BlockIcon from '@mui/icons-material/Block';

/**
 * Componente para proteger rutas basado en permisos
 * @param {object} props
 * @param {React.ReactNode} props.children - Componente hijo a renderizar si tiene acceso
 * @param {string} props.permission - Permiso individual requerido (formato: "module.action")
 * @param {array} props.permissions - Array de permisos (verifica que tenga al menos uno)
 * @param {boolean} props.requireAll - Si es true, requiere todos los permisos del array
 * @param {string} props.module - Módulo requerido
 * @param {string} props.redirectTo - Ruta a la que redirigir si no tiene acceso
 */
export const PermissionProtectedRoute = ({ 
  children, 
  permission,
  permissions = [],
  requireAll = false,
  module,
  redirectTo = '/unauthorized'
}) => {
  const { 
    hasPermission, 
    hasAnyPermission, 
    hasAllPermissions,
    hasModuleAccess,
    loading 
  } = usePermissions();

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh' 
      }}>
        <CircularProgress />
      </Box>
    );
  }

  let hasAccess = false;

  // Verificar por módulo
  if (module) {
    hasAccess = hasModuleAccess(module);
  }
  // Verificar por permiso individual
  else if (permission) {
    hasAccess = hasPermission(permission);
  }
  // Verificar por array de permisos
  else if (permissions && permissions.length > 0) {
    hasAccess = requireAll 
      ? hasAllPermissions(permissions) 
      : hasAnyPermission(permissions);
  }
  // Si no se especifica nada, permitir acceso
  else {
    hasAccess = true;
  }

  if (!hasAccess) {
    return <Navigate to={redirectTo} replace />;
  }

  return children;
};

/**
 * Componente para renderizar condicionalmente basado en permisos
 * @param {object} props
 * @param {React.ReactNode} props.children - Contenido a renderizar si tiene el permiso
 * @param {string} props.permission - Permiso individual requerido
 * @param {array} props.permissions - Array de permisos (verifica que tenga al menos uno)
 * @param {boolean} props.requireAll - Si es true, requiere todos los permisos
 * @param {string} props.module - Módulo requerido
 * @param {React.ReactNode} props.fallback - Contenido a renderizar si no tiene acceso
 */
export const PermissionBasedComponent = ({ 
  children, 
  permission,
  permissions = [],
  requireAll = false,
  module,
  fallback = null 
}) => {
  const { 
    hasPermission, 
    hasAnyPermission, 
    hasAllPermissions,
    hasModuleAccess,
    loading 
  } = usePermissions();

  if (loading) {
    return fallback;
  }

  let hasAccess = false;

  // Verificar por módulo
  if (module) {
    hasAccess = hasModuleAccess(module);
  }
  // Verificar por permiso individual
  else if (permission) {
    hasAccess = hasPermission(permission);
  }
  // Verificar por array de permisos
  else if (permissions && permissions.length > 0) {
    hasAccess = requireAll 
      ? hasAllPermissions(permissions) 
      : hasAnyPermission(permissions);
  }
  // Si no se especifica nada, permitir acceso
  else {
    hasAccess = true;
  }

  return hasAccess ? children : fallback;
};

/**
 * Página de acceso no autorizado
 */
export const UnauthorizedPage = () => {
  return (
    <Box sx={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      bgcolor: 'background.default',
      p: 3
    }}>
      <Paper sx={{ p: 4, textAlign: 'center', maxWidth: 500 }}>
        <BlockIcon sx={{ fontSize: 64, color: 'error.main', mb: 2 }} />
        <Typography variant="h5" gutterBottom>
          Acceso No Autorizado
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
          No tienes los permisos necesarios para acceder a esta página.
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Si crees que esto es un error, contacta con el administrador del sistema.
        </Typography>
      </Paper>
    </Box>
  );
};
