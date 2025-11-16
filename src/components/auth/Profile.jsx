import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Divider,
  Chip,
  CircularProgress,
  Alert,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import BadgeIcon from '@mui/icons-material/Badge';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PhoneIcon from '@mui/icons-material/Phone';
import HomeIcon from '@mui/icons-material/Home';
import WorkIcon from '@mui/icons-material/Work';
import LockIcon from '@mui/icons-material/Lock';
import { authService } from '../../services/authService';
import { formatApiErrors } from '../../utils/errorHandler';

const InfoRow = ({ icon, label, value }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
    <Box sx={{ color: 'primary.main' }}>{icon}</Box>
    <Box>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body1">{value || 'No especificado'}</Typography>
    </Box>
  </Box>
);

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openPasswordDialog, setOpenPasswordDialog] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const data = await authService.getProfile();
      setProfile(data);
    } catch (err) {
      setError(formatApiErrors(err));
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordDialogOpen = () => {
    setOpenPasswordDialog(true);
    setPasswordError('');
    setPasswordSuccess('');
    setPasswordForm({
      oldPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
  };

  const handlePasswordDialogClose = () => {
    setOpenPasswordDialog(false);
    setPasswordError('');
    setPasswordSuccess('');
  };

  const handlePasswordChange = (e) => {
    setPasswordForm({
      ...passwordForm,
      [e.target.name]: e.target.value
    });
    setPasswordError('');
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    // Validaciones frontend
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('Las contraseñas no coinciden');
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      setPasswordError('La nueva contraseña debe tener al menos 8 caracteres');
      return;
    }

    setPasswordLoading(true);

    try {
      await authService.changePassword(passwordForm.oldPassword, passwordForm.newPassword);
      setPasswordSuccess('Contraseña cambiada exitosamente');
      setTimeout(() => {
        handlePasswordDialogClose();
      }, 2000);
    } catch (err) {
      setPasswordError(formatApiErrors(err));
    } finally {
      setPasswordLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!profile) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">No se pudo cargar el perfil</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Card>
        <CardContent>
          <Typography variant="h5" component="h2" sx={{ mb: 3, fontWeight: 700 }}>
            Mi Perfil
          </Typography>

          <Grid container spacing={3}>
            {/* Información de Usuario */}
            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Información de Usuario
              </Typography>
              <InfoRow icon={<PersonIcon />} label="Usuario" value={profile.username} />
              <InfoRow icon={<EmailIcon />} label="Email" value={profile.email} />
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <WorkIcon color="primary" />
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Rol
                  </Typography>
                  <Box>
                    <Chip label={profile.group} color="primary" size="small" />
                  </Box>
                </Box>
              </Box>
            </Grid>

            {/* Información Personal */}
            {Object.keys(profile.perfil_data || {}).length > 0 && (
              <Grid item xs={12} md={6}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  Información Personal
                </Typography>
                
                {profile.perfil_data.nombre && (
                  <InfoRow
                    icon={<PersonIcon />}
                    label="Nombre Completo"
                    value={`${profile.perfil_data.nombre} ${profile.perfil_data.apellido || ''}`}
                  />
                )}
                
                {profile.perfil_data.ci && (
                  <InfoRow icon={<BadgeIcon />} label="Cédula" value={profile.perfil_data.ci} />
                )}
                
                {profile.perfil_data.fecha_nacimiento && (
                  <InfoRow
                    icon={<CalendarTodayIcon />}
                    label="Fecha de Nacimiento"
                    value={new Date(profile.perfil_data.fecha_nacimiento).toLocaleDateString('es-UY')}
                  />
                )}
                
                {profile.perfil_data.telefono && (
                  <InfoRow icon={<PhoneIcon />} label="Teléfono" value={profile.perfil_data.telefono} />
                )}
                
                {profile.perfil_data.direccion && (
                  <InfoRow icon={<HomeIcon />} label="Dirección" value={profile.perfil_data.direccion} />
                )}
              </Grid>
            )}

            {/* Información Profesional - Sin título, alineada con columna de información personal */}
            {(profile.perfil_data?.especialidad || profile.perfil_data?.cargo || profile.perfil_data?.registro_profesional) && (
              <Grid item xs={12} md={6}>
                {/* Espaciador para alinear con el título de la segunda columna */}
                <Box sx={{ height: '48px' }} />
                
                {profile.perfil_data.especialidad && (
                  <InfoRow
                    icon={<WorkIcon />}
                    label="Especialidad"
                    value={profile.perfil_data.especialidad}
                  />
                )}
                
                {profile.perfil_data.registro_profesional && (
                  <InfoRow
                    icon={<BadgeIcon />}
                    label="Registro Profesional"
                    value={profile.perfil_data.registro_profesional}
                  />
                )}
                
                {profile.perfil_data.cargo && (
                  <InfoRow icon={<WorkIcon />} label="Cargo" value={profile.perfil_data.cargo} />
                )}
              </Grid>
            )}
          </Grid>

          <Divider sx={{ my: 3 }} />

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              startIcon={<LockIcon />}
              onClick={handlePasswordDialogOpen}
            >
              Cambiar Contraseña
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Dialog para cambiar contraseña */}
      <Dialog open={openPasswordDialog} onClose={handlePasswordDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>Cambiar Contraseña</DialogTitle>
        <DialogContent>
          {passwordError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {passwordError}
            </Alert>
          )}
          {passwordSuccess && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {passwordSuccess}
            </Alert>
          )}
          <Box component="form" onSubmit={handlePasswordSubmit} sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Contraseña Actual"
              name="oldPassword"
              type="password"
              value={passwordForm.oldPassword}
              onChange={handlePasswordChange}
              required
              disabled={passwordLoading}
              sx={{ mb: 2 }}
              autoComplete="current-password"
            />
            <TextField
              fullWidth
              label="Nueva Contraseña"
              name="newPassword"
              type="password"
              value={passwordForm.newPassword}
              onChange={handlePasswordChange}
              required
              disabled={passwordLoading}
              helperText="Mínimo 8 caracteres"
              sx={{ mb: 2 }}
              autoComplete="new-password"
            />
            <TextField
              fullWidth
              label="Confirmar Nueva Contraseña"
              name="confirmPassword"
              type="password"
              value={passwordForm.confirmPassword}
              onChange={handlePasswordChange}
              required
              disabled={passwordLoading}
              sx={{ mb: 2 }}
              autoComplete="new-password"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handlePasswordDialogClose} disabled={passwordLoading}>
            Cancelar
          </Button>
          <Button
            onClick={handlePasswordSubmit}
            variant="contained"
            disabled={passwordLoading}
          >
            {passwordLoading ? 'Cambiando...' : 'Cambiar Contraseña'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
