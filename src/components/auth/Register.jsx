import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Alert from '@mui/material/Alert';
import Link from '@mui/material/Link';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { authService } from '../../services/authService';
import { formatApiErrors } from '../../utils/errorHandler';

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    ci: ''
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
    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (formData.password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    if (!/^\d{7,8}$/.test(formData.ci)) {
      setError('Cédula inválida (debe tener 7 u 8 dígitos)');
      return;
    }

    setLoading(true);

    try {
      await authService.register(
        formData.username,
        formData.password,
        formData.ci
      );

      setSuccess(true);
    } catch (err) {
      setError(formatApiErrors(err));
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default', p: 2 }}>
        <Box sx={{ maxWidth: 500, width: '100%' }}>
          <Card elevation={3}>
            <CardContent sx={{ textAlign: 'center', py: 5 }}>
              <Avatar sx={{ bgcolor: 'success.main', width: 80, height: 80, mx: 'auto', mb: 3 }}>
                <CheckCircleIcon sx={{ fontSize: 50 }} />
              </Avatar>
              <Typography variant="h5" component="h1" sx={{ fontWeight: 700, mb: 2, color: 'success.main' }}>
                ✅ Solicitud Enviada
              </Typography>
              <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
                Tu solicitud de registro ha sido enviada correctamente.
                Un administrador la revisará y te notificaremos cuando esté aprobada.
              </Typography>
              <Button
                variant="contained"
                onClick={() => navigate('/login')}
                sx={{ mt: 2 }}
              >
                Ir al Login
              </Button>
            </CardContent>
          </Card>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default', p: 2 }}>
      <Box sx={{ maxWidth: 450, width: '100%' }}>
        <Card elevation={3}>
          <CardContent sx={{ textAlign: 'center', pt: 4 }}>
            <Avatar sx={{ bgcolor: 'secondary.main', width: 64, height: 64, mx: 'auto', mb: 2 }}>
              <PersonAddIcon />
            </Avatar>
            <Typography variant="h5" component="h1" sx={{ fontWeight: 700, mb: 1 }}>
              Solicitar Registro
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Sistema de Agendamiento Médico
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 2, textAlign: 'left', whiteSpace: 'pre-line' }}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label="Cédula de Identidad"
                name="ci"
                value={formData.ci}
                onChange={handleChange}
                required
                disabled={loading}
                placeholder="12345678"
                helperText="Debe estar registrada previamente en el sistema"
                sx={{ mb: 2 }}
              />

              <TextField
                fullWidth
                label="Nombre de Usuario"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                disabled={loading}
                autoComplete="username"
                sx={{ mb: 2 }}
              />

              <TextField
                fullWidth
                label="Contraseña"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
                disabled={loading}
                autoComplete="new-password"
                helperText="Mínimo 8 caracteres"
                sx={{ mb: 2 }}
              />

              <TextField
                fullWidth
                label="Confirmar Contraseña"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                disabled={loading}
                autoComplete="new-password"
                sx={{ mb: 3 }}
              />

              <CardActions sx={{ justifyContent: 'center', p: 0, pb: 2 }}>
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={loading}
                  disableRipple
                  disableElevation
                  sx={{ '&:hover': { bgcolor: 'primary.main', boxShadow: 'none' } }}
                >
                  {loading ? 'Enviando solicitud...' : 'Enviar Solicitud'}
                </Button>
              </CardActions>
            </Box>

            <Typography variant="body2" sx={{ mt: 2 }}>
              ¿Ya tienes cuenta?{' '}
              <Link href="/login" underline="hover" sx={{ cursor: 'pointer' }}>
                Iniciar sesión
              </Link>
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}

