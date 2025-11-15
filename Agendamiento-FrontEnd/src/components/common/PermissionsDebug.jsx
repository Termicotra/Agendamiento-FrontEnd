/* eslint-disable react/prop-types */
import React, { useState } from 'react';
import { Box, Paper, Typography, Button, Collapse, Chip, Divider } from '@mui/material';
import { usePermissions } from '../../context/PermissionsContext';
import { useAuth } from '../../context/AuthContext';
import BugReportIcon from '@mui/icons-material/BugReport';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

/**
 * Componente temporal para debugging de permisos
 * ELIMINAR en producción
 */
export default function PermissionsDebug() {
  const [open, setOpen] = useState(false);
  const { 
    permissions, 
    modules, 
    roles, 
    loading, 
    error,
    refreshPermissions 
  } = usePermissions();
  const { authenticated, username, roles: authRoles } = useAuth();

  const handleRefresh = async () => {
    console.log('🔄 Refrescando permisos manualmente...');
    await refreshPermissions();
  };

  return (
    <Paper 
      sx={{ 
        position: 'fixed', 
        bottom: 16, 
        right: 16, 
        width: open ? 400 : 'auto',
        maxHeight: open ? '80vh' : 'auto',
        overflow: 'auto',
        zIndex: 9999,
        bgcolor: 'warning.light',
        borderRadius: 2
      }}
    >
      <Box 
        sx={{ 
          p: 2, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          cursor: 'pointer'
        }}
        onClick={() => setOpen(!open)}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <BugReportIcon />
          <Typography variant="h6">Debug Permisos</Typography>
        </Box>
        {open ? <ExpandLessIcon /> : <ExpandMoreIcon />}
      </Box>

      <Collapse in={open}>
        <Divider />
        <Box sx={{ p: 2 }}>
          {/* Estado de autenticación */}
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
            Autenticación:
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            • Usuario: {authenticated ? username : 'No autenticado'}
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            • Estado: {loading ? '⏳ Cargando...' : '✅ Cargado'}
          </Typography>
          {error && (
            <Typography variant="body2" color="error" sx={{ mb: 1 }}>
              • Error: {error}
            </Typography>
          )}

          <Divider sx={{ my: 2 }} />

          {/* Roles */}
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
            Roles (Auth Context):
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
            {authRoles && authRoles.length > 0 ? (
              authRoles.map(role => (
                <Chip key={role} label={role} size="small" color="primary" />
              ))
            ) : (
              <Typography variant="body2" color="text.secondary">Sin roles</Typography>
            )}
          </Box>

          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
            Roles (Permissions Context):
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
            {roles && roles.length > 0 ? (
              roles.map(role => (
                <Chip key={role} label={role} size="small" color="secondary" />
              ))
            ) : (
              <Typography variant="body2" color="text.secondary">Sin roles</Typography>
            )}
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Módulos */}
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
            Módulos accesibles ({modules?.length || 0}):
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
            {modules && modules.length > 0 ? (
              modules.map(module => (
                <Chip key={module} label={module} size="small" color="success" />
              ))
            ) : (
              <Typography variant="body2" color="text.secondary">Sin módulos</Typography>
            )}
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Permisos */}
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
            Permisos ({permissions?.length || 0}):
          </Typography>
          <Box sx={{ maxHeight: 200, overflow: 'auto', mb: 2 }}>
            {permissions && permissions.length > 0 ? (
              permissions.map(perm => (
                <Typography key={perm} variant="caption" display="block" sx={{ fontFamily: 'monospace' }}>
                  • {perm}
                </Typography>
              ))
            ) : (
              <Typography variant="body2" color="text.secondary">Sin permisos</Typography>
            )}
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* LocalStorage */}
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
            LocalStorage:
          </Typography>
          <Typography variant="caption" display="block" sx={{ fontFamily: 'monospace', mb: 0.5 }}>
            • JWT: {localStorage.getItem('jwt') ? '✅' : '❌'}
          </Typography>
          <Typography variant="caption" display="block" sx={{ fontFamily: 'monospace', mb: 0.5 }}>
            • Roles: {localStorage.getItem('user_roles') ? '✅' : '❌'}
          </Typography>
          <Typography variant="caption" display="block" sx={{ fontFamily: 'monospace', mb: 2 }}>
            • Permisos: {localStorage.getItem('user_permissions') ? '✅' : '❌'}
          </Typography>

          {/* Botón de refresh */}
          <Button 
            fullWidth 
            variant="contained" 
            size="small"
            onClick={handleRefresh}
            disabled={loading}
          >
            {loading ? 'Cargando...' : 'Refrescar Permisos'}
          </Button>

          <Typography variant="caption" display="block" sx={{ mt: 1, color: 'error.main', textAlign: 'center' }}>
            ⚠️ Componente de debug - Eliminar en producción
          </Typography>
        </Box>
      </Collapse>
    </Paper>
  );
}
