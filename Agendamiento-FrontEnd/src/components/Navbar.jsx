import React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
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
import { Link } from 'react-router-dom';
import PeopleIcon from '@mui/icons-material/People';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import BadgeIcon from '@mui/icons-material/Badge';
import WorkIcon from '@mui/icons-material/Work';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import { authClient } from '../config/apiClient';
import { AUTH_ENDPOINTS } from '../config/endpoint';

export default function Navbar() {
  const { username, logout } = useAuth();
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const navLinks = [
    { label: 'Pacientes', icon: <PeopleIcon />, to: '/pacientes' },
    { label: 'Turnos', icon: <EventAvailableIcon />, to: '/turnos' },
    { label: 'Profesionales', icon: <BadgeIcon />, to: '/profesionales' },
    { label: 'Empleados', icon: <WorkIcon />, to: '/empleados' },
  ];

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
        <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 2 }}>
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
          <Typography sx={{ color: 'white', fontWeight: 600 }}>{username || 'Usuario'}</Typography>
          <Button
            variant="outlined"
            color="inherit"
            size="small"
            disableRipple
            sx={{ ml: 1, '&:hover': { bgcolor: 'transparent', borderColor: 'inherit', color: 'inherit' } }}
            onClick={handleLogout}
          >
            Cerrar sesión
          </Button>
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
