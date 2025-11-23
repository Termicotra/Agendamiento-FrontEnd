import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Alert,
} from '@mui/material';
import LockResetIcon from '@mui/icons-material/LockReset';
import { authService } from '../../services/authService';
import { formatApiErrors } from '../../utils/errorHandler';

export default function ChangePassword() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validaciones frontend
    if (formData.newPassword !== formData.confirmPassword) {
      setError('Las contraseñas nuevas no coinciden');
      return;
    }

    if (formData.newPassword.length < 8) {
      setError('La nueva contraseña debe tener al menos 8 caracteres');
      return;
    }

    if (formData.oldPassword === formData.newPassword) {
      setError('La nueva contraseña debe ser diferente a la actual');
      return;
    }

    setLoading(true);

    try {
      await authService.changePassword(
        formData.oldPassword,
        formData.newPassword,
        formData.confirmPassword
      );

      setSuccess(true);
      setTimeout(() => {
        navigate('/profile');
      }, 2000);
    } catch (err) {
      setError(formatApiErrors(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <LockResetIcon color="primary" sx={{ fontSize: 40 }} />
            <Typography variant="h5" component="h2" sx={{ fontWeight: 700 }}>
              Cambiar Contraseña
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Contraseña cambiada exitosamente. Redirigiendo...
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Contraseña Actual"
              name="oldPassword"
              type="password"
              value={formData.oldPassword}
              onChange={handleChange}
              required
              disabled={loading || success}
              autoComplete="current-password"
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              label="Nueva Contraseña"
              name="newPassword"
              type="password"
              value={formData.newPassword}
              onChange={handleChange}
              required
              disabled={loading || success}
              autoComplete="new-password"
              helperText="Mínimo 8 caracteres"
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              label="Confirmar Nueva Contraseña"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              disabled={loading || success}
              autoComplete="new-password"
              sx={{ mb: 3 }}
            />

            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                type="submit"
                variant="contained"
                disabled={loading || success}
                fullWidth
              >
                {loading ? 'Cambiando...' : 'Cambiar Contraseña'}
              </Button>
              <Button
                variant="outlined"
                onClick={() => navigate('/profile')}
                disabled={loading}
                fullWidth
              >
                Cancelar
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}

