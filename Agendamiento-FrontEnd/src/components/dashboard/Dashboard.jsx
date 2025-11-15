import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { usePermissions } from '../../context/PermissionsContext';
import { MODULES } from '../../config/permissions';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import PeopleIcon from '@mui/icons-material/People';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import BadgeIcon from '@mui/icons-material/Badge';
import WorkIcon from '@mui/icons-material/Work';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import PermissionsDebug from '../common/PermissionsDebug';

const allModules = [
  {
    title: 'Pacientes',
    description: 'Gestiona los pacientes registrados.',
    icon: PeopleIcon,
    href: '/pacientes',
    module: MODULES.PACIENTES,
    color: '#1976d2', // azul
  },
  {
    title: 'Turnos',
    description: 'Gestiona los turnos agendados.',
    icon: EventAvailableIcon,
    href: '/turnos',
    module: MODULES.TURNOS,
    color: '#2e7d32', // verde
  },
  {
    title: 'Profesionales',
    description: 'Gestiona los profesionales médicos.',
    icon: BadgeIcon,
    href: '/profesionales',
    module: MODULES.PROFESIONALES,
    color: '#9c27b0', // morado
  },
  {
    title: 'Empleados',
    description: 'Gestiona los empleados del sistema.',
    icon: WorkIcon,
    href: '/empleados',
    module: MODULES.EMPLEADOS,
    color: '#ed6c02', // naranja
  },
];

export default function Dashboard() {
  const { hasRole } = useAuth();
  const { hasModuleAccess } = usePermissions();
  
  // Filtrar módulos según permisos del usuario
  const modules = allModules.filter(module => hasModuleAccess(module.module));
  
  // Módulos adicionales que no dependen de permisos sino de roles
  const additionalModules = [];
  
  // Solicitudes de registro (solo administradores)
  if (hasRole('administradores')) {
    additionalModules.push({
      title: 'Solicitudes',
      description: 'Gestiona solicitudes de registro pendientes.',
      icon: AssignmentIcon,
      href: '/admin/solicitudes',
      color: '#d32f2f', // rojo
    });
    
    // Solicitudes de turnos (solo administradores)
    additionalModules.push({
      title: 'Solicitudes de Turnos',
      description: 'Gestiona solicitudes de turnos pendientes.',
  icon: PendingActionsIcon,
  href: '/admin/solicitudes-turnos',
  color: '#2e7d32', // verde
  iconColor: '#fff',
    });
  }
  
  const allVisibleModules = [...modules, ...additionalModules];
  
  return (
  <Box sx={{ minHeight: '0', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', p: 2, mt: 3, pt: 2 }}>
      <PermissionsDebug />
      <Box sx={{ maxWidth: 1200 }}>
        <Typography variant="h4" component="h2" sx={{ fontWeight: 700, textAlign: 'center', mb: 4 }}>
          Menú Principal
        </Typography>
        {allVisibleModules.length === 0 ? (
          <Typography variant="body1" color="text.secondary" textAlign="center">
            No tienes acceso a ningún módulo. Contacta con el administrador.
          </Typography>
        ) : (
          <Grid container spacing={4} justifyContent="center" alignItems="stretch">
            {allVisibleModules.map((module) => {
              const IconComp = module.icon;
              return (
                <Grid item xs={12} sm={6} md={3} key={module.title} sx={{ display: 'flex' }}>
                  <Card elevation={3} sx={{ width: '100%', minWidth: 260, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <CardContent sx={{ flexGrow: 1, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                      <Avatar sx={{ bgcolor: module.color || 'primary.main', width: 64, height: 64, mb: 2 }}>
                        {/* Si el módulo tiene iconColor, usarlo */}
                        {module.iconColor ? <IconComp sx={{ color: module.iconColor }} /> : <IconComp />}
                      </Avatar>
                      <Typography variant="h6" component="h3" sx={{ fontWeight: 600, mb: 1 }}>
                        {module.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {module.description}
                      </Typography>
                    </CardContent>
                    <CardActions sx={{ justifyContent: 'center', pb: 2 }}>
                      <Button component={Link} to={module.href} variant="contained" disableRipple disableElevation sx={{ '&:hover': { bgcolor: 'primary.main', boxShadow: 'none', color: 'inherit' } }}>
                        Ver {module.title}
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}
      </Box>
    </Box>
  );
}