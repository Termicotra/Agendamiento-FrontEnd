import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Collapse,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import apiClient from '../../config/apiClient';
import { API_ENDPOINTS } from '../../config/endpoint';
import { formatApiErrors } from '../../utils/errorHandler';
import { authService } from '../../services/authService';

export default function MiHistorialMedico() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pacienteData, setPacienteData] = useState(null);
  const [historiales, setHistoriales] = useState([]);
  const [expandedRows, setExpandedRows] = useState({});

  useEffect(() => {
    loadHistorial();
  }, []);

  const loadHistorial = async () => {
    try {
      // Primero obtener el perfil del usuario autenticado (incluye la cédula)
      const profile = await authService.getProfile();
      
      if (!profile.perfil_data?.ci) {
        setError('No se encontró información de cédula en tu perfil');
        setLoading(false);
        return;
      }

      // Buscar el paciente por cédula
      const pacientesResponse = await apiClient.get(API_ENDPOINTS.PACIENTES);
      const paciente = pacientesResponse.data.find(p => p.ci === profile.perfil_data.ci);
      
      if (!paciente) {
        setError('No se encontró información de paciente asociada a tu usuario');
        setLoading(false);
        return;
      }

      setPacienteData(paciente);

      // Obtener historiales del paciente
      const historialesResponse = await apiClient.get(API_ENDPOINTS.HISTORIALES_CLINICOS);
      // Filtrar historiales donde el id del paciente coincida
      const historialesPaciente = historialesResponse.data.filter(
        h => h.paciente?.id_paciente === paciente.id || h.paciente?.id === paciente.id
      );
      
      setHistoriales(historialesPaciente);
    } catch (err) {
      setError(formatApiErrors(err));
    } finally {
      setLoading(false);
    }
  };

  const toggleRow = (id) => {
    setExpandedRows(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
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

  return (
    <Box sx={{ p: 3 }}>
      <Card>
        <CardContent>
          <Typography variant="h5" component="h2" sx={{ mb: 3, fontWeight: 700 }}>
            Mi Historial Médico
          </Typography>

          {pacienteData && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="body1" color="text.secondary">
                Paciente: <strong>{pacienteData.nombre} {pacienteData.apellido}</strong>
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Cédula: {pacienteData.ci}
              </Typography>
            </Box>
          )}

          {historiales.length === 0 ? (
            <Alert severity="info">No tienes historiales médicos registrados</Alert>
          ) : (
            <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e0e0e0' }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'primary.main' }}>
                    <TableCell sx={{ color: 'white', fontWeight: 600 }}>Fecha</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 600 }}>Profesional</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 600 }}>Motivo</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 600 }} align="center">Detalles</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {historiales.map((historial) => (
                    <React.Fragment key={historial.id_historial}>
                      <TableRow hover>
                        <TableCell>
                          {new Date(historial.fecha).toLocaleDateString('es-UY')}
                        </TableCell>
                        <TableCell>
                          {historial.profesional 
                            ? `${historial.profesional.nombre} ${historial.profesional.apellido}` 
                            : 'N/A'}
                        </TableCell>
                        <TableCell>{historial.razon || 'No especificado'}</TableCell>
                        <TableCell align="center">
                          <IconButton
                            size="small"
                            onClick={() => toggleRow(historial.id_historial)}
                            color="primary"
                          >
                            {expandedRows[historial.id_historial] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                          </IconButton>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell colSpan={4} sx={{ p: 0, border: 0 }}>
                          <Collapse in={expandedRows[historial.id_historial]} timeout="auto" unmountOnExit>
                            <Box sx={{ p: 3, bgcolor: 'grey.50' }}>
                              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                                Descripción:
                              </Typography>
                              <Typography variant="body2" sx={{ mb: 2 }}>
                                {historial.descripcion || 'No especificado'}
                              </Typography>
                              
                              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                                Hora:
                              </Typography>
                              <Typography variant="body2" sx={{ mb: 2 }}>
                                {historial.hora || 'No especificado'}
                              </Typography>
                              
                              {historial.profesional && (
                                <>
                                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                                    Especialidad:
                                  </Typography>
                                  <Typography variant="body2">
                                    {historial.profesional.especialidad}
                                  </Typography>
                                </>
                              )}
                            </Box>
                          </Collapse>
                        </TableCell>
                      </TableRow>
                    </React.Fragment>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
