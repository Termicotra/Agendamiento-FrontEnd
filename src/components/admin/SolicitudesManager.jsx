import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
  ButtonGroup,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { solicitudesService } from '../../services/solicitudesService';
import { formatApiErrors } from '../../utils/errorHandler';

export default function SolicitudesManager() {
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('pendiente');
  const [selectedRoles, setSelectedRoles] = useState({}); // Estado para roles seleccionados
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    solicitudId: null,
    action: null,
    group: ''
  });

  useEffect(() => {
    loadSolicitudes();
  }, [filter]);

  const loadSolicitudes = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await solicitudesService.listarSolicitudes(filter === 'todas' ? null : filter);
      setSolicitudes(data.solicitudes || []);
      // Resetear roles seleccionados cuando se cargan nuevas solicitudes
      setSelectedRoles({});
    } catch (err) {
      setError(formatApiErrors(err));
    } finally {
      setLoading(false);
    }
  };

  const handleOpenConfirm = (solicitudId, action, group = '') => {
    setConfirmDialog({
      open: true,
      solicitudId,
      action,
      group
    });
  };

  const handleCloseConfirm = () => {
    setConfirmDialog({
      open: false,
      solicitudId: null,
      action: null,
      group: ''
    });
  };

  const handleAprobar = async () => {
    const { solicitudId, group } = confirmDialog;
    if (!group) {
      setError('Debes seleccionar un rol');
      return;
    }

    try {
      await solicitudesService.aprobarSolicitud(solicitudId, group);
      setError('');
      handleCloseConfirm();
      loadSolicitudes();
    } catch (err) {
      setError(formatApiErrors(err));
      handleCloseConfirm();
    }
  };

  const handleRechazar = async () => {
    try {
      await solicitudesService.rechazarSolicitud(confirmDialog.solicitudId);
      setError('');
      handleCloseConfirm();
      loadSolicitudes();
    } catch (err) {
      setError(formatApiErrors(err));
      handleCloseConfirm();
    }
  };

  const getEstadoChip = (estado) => {
    const config = {
      pendiente: { color: 'warning', label: 'Pendiente' },
      aprobada: { color: 'success', label: 'Aprobada' },
      rechazada: { color: 'error', label: 'Rechazada' }
    };
    const { color, label } = config[estado] || { color: 'default', label: estado };
    return <Chip label={label} color={color} size="small" />;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('es-UY', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Card>
        <CardContent>
          <Typography variant="h5" component="h2" sx={{ mb: 3, fontWeight: 700 }}>
            Gestión de Solicitudes de Registro
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          <Box sx={{ mb: 3, display: 'flex', gap: 1 }}>
            <ButtonGroup variant="outlined">
              <Button
                variant={filter === 'pendiente' ? 'contained' : 'outlined'}
                onClick={() => setFilter('pendiente')}
              >
                Pendientes
              </Button>
              <Button
                variant={filter === 'aprobada' ? 'contained' : 'outlined'}
                onClick={() => setFilter('aprobada')}
              >
                Aprobadas
              </Button>
              <Button
                variant={filter === 'rechazada' ? 'contained' : 'outlined'}
                onClick={() => setFilter('rechazada')}
              >
                Rechazadas
              </Button>
              <Button
                variant={filter === 'todas' ? 'contained' : 'outlined'}
                onClick={() => setFilter('todas')}
              >
                Todas
              </Button>
            </ButtonGroup>
          </Box>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : solicitudes.length === 0 ? (
            <Alert severity="info">
              {filter === 'todas' 
                ? 'No hay solicitudes disponibles'
                : `No hay solicitudes ${filter}s`
              }
            </Alert>
          ) : (
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'grey.100' }}>
                    <TableCell><strong>ID</strong></TableCell>
                    <TableCell><strong>Usuario</strong></TableCell>
                    <TableCell><strong>Cédula</strong></TableCell>
                    <TableCell><strong>Estado</strong></TableCell>
                    <TableCell><strong>Fecha Solicitud</strong></TableCell>
                    <TableCell><strong>Procesada Por</strong></TableCell>
                    <TableCell align="center"><strong>Acciones</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {solicitudes.map((sol) => (
                    <TableRow key={sol.id} hover>
                      <TableCell>{sol.id}</TableCell>
                      <TableCell>{sol.username}</TableCell>
                      <TableCell>{sol.ci}</TableCell>
                      <TableCell>{getEstadoChip(sol.estado)}</TableCell>
                      <TableCell>{formatDate(sol.fecha_solicitud)}</TableCell>
                      <TableCell>{sol.procesada_por || '-'}</TableCell>
                      <TableCell>
                        {sol.estado === 'pendiente' && (
                          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                            <FormControl size="small" sx={{ minWidth: 120 }}>
                              <InputLabel>Rol</InputLabel>
                              <Select
                                value={selectedRoles[sol.id] ?? ''}
                                onChange={(e) => setSelectedRoles({ 
                                  ...selectedRoles, 
                                  [sol.id]: e.target.value 
                                })}
                                label="Rol"
                              >
                                <MenuItem value="pacientes">Paciente</MenuItem>
                                <MenuItem value="profesionales">Profesional</MenuItem>
                                <MenuItem value="empleados">Empleado</MenuItem>
                                <MenuItem value="administradores">Administrador</MenuItem>
                              </Select>
                            </FormControl>
                            <Button
                              size="small"
                              variant="contained"
                              color="success"
                              startIcon={<CheckCircleIcon />}
                              onClick={() => {
                                const group = selectedRoles[sol.id];
                                if (group) {
                                  handleOpenConfirm(sol.id, 'aprobar', group);
                                } else {
                                  setError('Selecciona un rol primero');
                                }
                              }}
                            >
                              Aprobar
                            </Button>
                            <Button
                              size="small"
                              variant="contained"
                              color="error"
                              startIcon={<CancelIcon />}
                              onClick={() => handleOpenConfirm(sol.id, 'rechazar')}
                            >
                              Rechazar
                            </Button>
                          </Box>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Dialog de confirmación */}
      <Dialog open={confirmDialog.open} onClose={handleCloseConfirm}>
        <DialogTitle>
          {confirmDialog.action === 'aprobar' ? 'Confirmar Aprobación' : 'Confirmar Rechazo'}
        </DialogTitle>
        <DialogContent>
          {confirmDialog.action === 'aprobar' ? (
            <Typography>
              ¿Estás seguro de aprobar esta solicitud como <strong>{confirmDialog.group}</strong>?
            </Typography>
          ) : (
            <Typography>
              ¿Estás seguro de rechazar esta solicitud?
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirm}>Cancelar</Button>
          <Button
            onClick={confirmDialog.action === 'aprobar' ? handleAprobar : handleRechazar}
            variant="contained"
            color={confirmDialog.action === 'aprobar' ? 'success' : 'error'}
          >
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
