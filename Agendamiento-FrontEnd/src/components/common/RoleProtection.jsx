/* eslint-disable react/prop-types */
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useRoles } from '../../hooks/useRoles';
import { Box, Typography, Paper } from '@mui/material';
import BlockIcon from '@mui/icons-material/Block';

/**
 * Componente para proteger rutas basado en roles
 * @param {object} props
 * @param {React.ReactNode} props.children - Componente hijo a renderizar si tiene acceso
 * @param {array} props.allowedRoles - Array de roles permitidos para acceder
 * @param {string} props.redirectTo - Ruta a la que redirigir si no tiene acceso (por defecto '/')
 * @param {boolean} props.requireAll - Si es true, requiere todos los roles. Si es false, requiere al menos uno (por defecto false)
 */
export const RoleProtectedRoute = ({ 
  children, 
  allowedRoles = [], 
  redirectTo = '/', 
  requireAll = false 
}) => {
  const { authenticated, loading } = useAuth();
  const { hasAnyRole, hasAllRoles } = useRoles();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Typography>Cargando...</Typography>
      </Box>
    );
  }

  if (!authenticated) {
    return <Navigate to="/login" replace />;
  }

  // Si no se especifican roles, permitir acceso a usuarios autenticados
  if (!allowedRoles || allowedRoles.length === 0) {
    return children;
  }

  const hasAccess = requireAll 
    ? hasAllRoles(allowedRoles) 
    : hasAnyRole(allowedRoles);

  if (!hasAccess) {
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
            Acceso Denegado
          </Typography>
          <Typography variant="body1" color="text.secondary">
            No tienes permisos para acceder a esta página.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Roles requeridos: {allowedRoles.join(', ')}
          </Typography>
        </Paper>
      </Box>
    );
  }

  return children;
};

/**
 * Componente para renderizar condicionalmente basado en roles
 * @param {object} props
 * @param {React.ReactNode} props.children - Contenido a renderizar si tiene el rol
 * @param {array} props.allowedRoles - Array de roles permitidos
 * @param {boolean} props.requireAll - Si es true, requiere todos los roles (por defecto false)
 * @param {React.ReactNode} props.fallback - Contenido a renderizar si no tiene acceso
 */
export const RoleBasedComponent = ({ 
  children, 
  allowedRoles = [], 
  requireAll = false,
  fallback = null 
}) => {
  const { hasAnyRole, hasAllRoles } = useRoles();

  // Si no se especifican roles, renderizar children
  if (!allowedRoles || allowedRoles.length === 0) {
    return children;
  }

  const hasAccess = requireAll 
    ? hasAllRoles(allowedRoles) 
    : hasAnyRole(allowedRoles);

  return hasAccess ? children : fallback;
};
