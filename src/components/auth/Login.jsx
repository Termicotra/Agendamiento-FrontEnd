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
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';
import { formatApiErrors } from '../../utils/errorHandler';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
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
    setLoading(true);
    setError('');

    try {
      // Usar el servicio de autenticación
      const userData = await authService.login(formData.username, formData.password);
      
      // Actualizar el contexto de autenticación
      const accessToken = localStorage.getItem('jwt');
      login(accessToken, userData);
      
      // Redirigir al dashboard principal (los módulos se mostrarán según permisos)
      navigate('/');
    } catch (err) {
      setError(formatApiErrors(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default', p: 2 }}>
      <Box sx={{ maxWidth: 400, width: '100%' }}>
        <Card elevation={3}>
          <CardContent sx={{ textAlign: 'center', pt: 4 }}>
            <Avatar sx={{ bgcolor: 'primary.main', width: 64, height: 64, mx: 'auto', mb: 2 }}>
              <LockOutlinedIcon />
            </Avatar>
            <Typography variant="h5" component="h1" sx={{ fontWeight: 700, mb: 1 }}>
              Iniciar Sesión
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Sistema de Agendamiento Médico
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 2, textAlign: 'left' }}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label="Usuario"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                sx={{ mb: 2 }}
                disabled={loading}
                autoComplete="username"
              />
              <TextField
                fullWidth
                label="Contraseña"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
                sx={{ mb: 3 }}
                disabled={loading}
                autoComplete="current-password"
              />
              <CardActions sx={{ justifyContent: 'center', p: 0, pb: 2 }}>
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={loading}
                  disableRipple
                  disableElevation
                  sx={{ '&:hover': { bgcolor: 'primary.main', boxShadow: 'none', color: 'inherit' } }}
                >
                  {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                </Button>
              </CardActions>
            </Box>

            <Typography variant="body2" sx={{ mt: 2 }}>
              ¿No tienes cuenta?{' '}
              <Link href="/register" underline="hover" sx={{ cursor: 'pointer' }}>
                Solicitar registro
              </Link>
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}

