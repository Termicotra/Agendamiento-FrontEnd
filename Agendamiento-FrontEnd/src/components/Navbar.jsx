import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePermissions } from '../context/PermissionsContext';
import { MODULES } from '../config/permissions';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import MenuIcon from '@mui/icons-material/Menu';
import PeopleIcon from '@mui/icons-material/People';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import BadgeIcon from '@mui/icons-material/Badge';
import WorkIcon from '@mui/icons-material/Work';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import AssignmentIcon from '@mui/icons-material/Assignment';
import HistoryIcon from '@mui/icons-material/History';
import DescriptionIcon from '@mui/icons-material/Description';
import FolderSharedIcon from '@mui/icons-material/FolderShared';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Divider from '@mui/material/Divider';
import { authClient } from '../config/apiClient';
import { AUTH_ENDPOINTS } from '../config/endpoint';

export default function Navbar() {
  const { username, logout, hasRole } = useAuth();
  const { hasModuleAccess } = usePermissions();
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const menuOpen = Boolean(anchorEl);

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleProfileClick = () => {
    handleMenuClose();
    navigate('/profile');
  };

  const handleHistorialClick = () => {
    handleMenuClose();
    navigate('/mi-historial');
  };

  const handleSolicitudesClick = () => {
    handleMenuClose();
    navigate('/admin/solicitudes');
  };

  // Definir todos los links posibles con sus módulos requeridos
  const allNavLinks = [
    { 
      label: 'Pacientes', 
      icon: <PeopleIcon />,
      to: '/pacientes',
      module: MODULES.PACIENTES 
    },
    { 
      label: 'Turnos', 
      icon: <EventAvailableIcon />,
      to: '/turnos',
      module: MODULES.TURNOS 
    },
    { 
      label: 'Profesionales', 
      icon: <BadgeIcon />,
      to: '/profesionales',
      module: MODULES.PROFESIONALES 
    },
    { 
      label: 'Empleados', 
      icon: <WorkIcon />,
      to: '/empleados',
      module: MODULES.EMPLEADOS 
    },
  ];

  // Filtrar links basado en permisos
  const navLinks = allNavLinks.filter(link => hasModuleAccess(link.module));

  const handleLogout = async () => {
    const accessToken = localStorage.getItem('jwt');
    const refreshToken = localStorage.getItem('refresh');
    if (accessToken && refreshToken) {
      try {
        await authClient.post(
          AUTH_ENDPOINTS.LOGOUT,
          { refresh: refreshToken },
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
      } catch (e) {
        console.log('Error en logout:', e);
      }
    }
    logout();
    navigate('/login');
  };

  return (
    <AppBar position="fixed" color="primary" elevation={3}>
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton edge="start" color="inherit" component={Link} to="/" disableRipple sx={{ '&:hover': { bgcolor: 'transparent' } }}>
            <LocalHospitalIcon />
          </IconButton>
          <Typography variant="h6" component={Link} to="/" sx={{ color: 'inherit', textDecoration: 'none', fontWeight: 'bold', '&:hover': { color: 'inherit' } }}>
            Agendamiento Médico
          </Typography>
        </Box>
        {/* Desktop nav links */}
        <Box sx={{ 
          display: { xs: 'none', md: 'flex' }, 
          alignItems: 'center', 
          gap: 2,
          position: 'absolute',
          left: '50%',
          transform: 'translateX(-50%)'
        }}>
          {navLinks.map(link => (
            <Button key={link.label} color="inherit" startIcon={link.icon} component={Link} to={link.to} disableRipple sx={{ '&:hover': { bgcolor: 'transparent', color: 'inherit' } }}>
              {link.label}
            </Button>
          ))}
        </Box>
        {/* Mobile menu icon */}
        <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center' }}>
          <IconButton color="inherit" onClick={() => setDrawerOpen(true)} disableRipple sx={{ '&:hover': { bgcolor: 'transparent' } }}>
            <MenuIcon />
          </IconButton>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton
            color="inherit"
            onClick={handleMenuClick}
            disableRipple
            sx={{ '&:hover': { bgcolor: 'transparent' } }}
          >
            <AccountCircleIcon />
          </IconButton>
          <Typography sx={{ color: 'white', fontWeight: 600, display: { xs: 'none', sm: 'block' } }}>
            {username || 'Usuario'}
          </Typography>
          
          <Menu
            anchorEl={anchorEl}
            open={menuOpen}
            onClose={handleMenuClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            <MenuItem onClick={handleProfileClick}>
              <ListItemIcon>
                <AccountCircleIcon fontSize="small" />
              </ListItemIcon>
              Mi Perfil
            </MenuItem>
            {hasRole('pacientes') && (
              <MenuItem onClick={handleHistorialClick}>
                <ListItemIcon>
                  <HistoryIcon fontSize="small" />
                </ListItemIcon>
                Mi Historial Médico
              </MenuItem>
            )}
            {hasRole('administradores') && <Divider />}
            {hasRole('administradores') && (
              <MenuItem onClick={handleSolicitudesClick}>
                <ListItemIcon>
                  <AssignmentIcon fontSize="small" />
                </ListItemIcon>
                Solicitudes de Registro
              </MenuItem>
            )}
            {hasRole('administradores') && (
              <MenuItem onClick={() => { handleMenuClose(); navigate('/admin/solicitudes-turnos'); }}>
                <ListItemIcon>
                  <AssignmentIcon fontSize="small" />
                </ListItemIcon>
                Solicitudes de Turno
              </MenuItem>
            )}
            <Divider />
            <MenuItem onClick={handleLogout}>Cerrar sesión</MenuItem>
          </Menu>
        </Box>
        {/* Drawer for mobile nav */}
        <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
          <Box sx={{ width: 220 }} role="presentation" onClick={() => setDrawerOpen(false)}>
            <List>
              {navLinks.map(link => (
                <ListItem key={link.label} disablePadding>
                  <ListItemButton component={Link} to={link.to} disableRipple sx={{ '&:hover': { bgcolor: 'transparent' } }}>
                    <ListItemIcon>{link.icon}</ListItemIcon>
                    <ListItemText primary={link.label} />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Box>
        </Drawer>
      </Toolbar>
    </AppBar>
  );
}
