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
    <Box sx={{ 
      minHeight: 'calc(100vh - 64px)', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      p: 4,
      bgcolor: 'background.default'
    }}>
      <PermissionsDebug />
      <Box sx={{ maxWidth: 1400, width: '100%' }}>
        <Typography 
          variant="h4" 
          component="h2" 
          sx={{ 
            fontWeight: 700, 
            textAlign: 'center', 
            mb: 6,
            color: 'text.primary'
          }}
        >
          Menú Principal
        </Typography>
        {allVisibleModules.length === 0 ? (
          <Typography variant="body1" color="text.secondary" textAlign="center">
            No tienes acceso a ningún módulo. Contacta con el administrador.
          </Typography>
        ) : (
          <Grid 
            container 
            spacing={3} 
            justifyContent="center" 
            alignItems="stretch"
            sx={{ margin: '0 auto' }}
          >
            {allVisibleModules.map((module) => {
              const IconComp = module.icon;
              return (
                <Grid 
                  item 
                  xs={12} 
                  sm={6} 
                  md={4} 
                  lg={3} 
                  key={module.title} 
                  sx={{ 
                    display: 'flex',
                    justifyContent: 'center'
                  }}
                >
                  <Card 
                    elevation={3} 
                    sx={{ 
                      width: '100%',
                      maxWidth: 280,
                      minWidth: 280,
                      height: 280,
                      display: 'flex', 
                      flexDirection: 'column', 
                      justifyContent: 'space-between',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 6
                      }
                    }}
                  >
                    <CardContent 
                      sx={{ 
                        flexGrow: 1, 
                        textAlign: 'center', 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        p: 3
                      }}
                    >
                      <Avatar 
                        sx={{ 
                          bgcolor: module.color || 'primary.main', 
                          width: 72, 
                          height: 72, 
                          mb: 2 
                        }}
                      >
                        {module.iconColor ? (
                          <IconComp sx={{ fontSize: 40, color: module.iconColor }} />
                        ) : (
                          <IconComp sx={{ fontSize: 40 }} />
                        )}
                      </Avatar>
                      <Typography 
                        variant="h6" 
                        component="h3" 
                        sx={{ 
                          fontWeight: 600, 
                          mb: 1.5,
                          minHeight: '32px',
                          display: 'flex',
                          alignItems: 'center'
                        }}
                      >
                        {module.title}
                      </Typography>
                      <Typography 
                        variant="body2" 
                        color="text.secondary"
                        sx={{
                          minHeight: '40px',
                          display: 'flex',
                          alignItems: 'center',
                          textAlign: 'center'
                        }}
                      >
                        {module.description}
                      </Typography>
                    </CardContent>
                    <CardActions sx={{ justifyContent: 'center', pb: 2.5, px: 2 }}>
                      <Button 
                        component={Link} 
                        to={module.href} 
                        variant="contained" 
                        fullWidth
                        sx={{ 
                          textTransform: 'none',
                          fontWeight: 500,
                          py: 1,
                          '&:hover': { 
                            boxShadow: 2
                          } 
                        }}
                      >
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
