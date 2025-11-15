import React, { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import apiClient from '../../config/apiClient';
import { API_ENDPOINTS } from '../../config/endpoint';
import DynamicTable from '../common/DynamicTable';

export default function SolicitudesTurno() {
  // HOOKS
  const [turnos, setTurnos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  // FUNCIONES
  useEffect(() => {
    fetchTurnosPendientes();
  }, []);

  const fetchTurnosPendientes = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get(`${API_ENDPOINTS.TURNOS}?estado=Pendiente`);
      setTurnos(response.data);
      setError(null);
    } catch (err) {
      setError('Error al cargar las solicitudes de turno');
    } finally {
      setLoading(false);
    }
  };

  const handleActivar = async (id) => {
    setUpdatingId(id);
    try {
      const turno = turnos.find(t => t.id_turno === id);
      if (!turno) {
        setError('Turno no encontrado');
        return;
      }
      const turnoActualizado = {
        paciente_id: turno.paciente?.id_paciente,
        profesional_id: turno.profesional?.id_profesional,
        empleado_id: turno.empleado?.id_empleado,
        fecha: turno.fecha,
        hora: turno.hora,
        motivo: turno.motivo,
        fue_notificado: turno.fue_notificado,
        estado: 'Activo'
      };
      await apiClient.put(`${API_ENDPOINTS.TURNOS}${id}/`, turnoActualizado);
      await fetchTurnosPendientes();
      setError(null);
    } catch (err) {
      console.error('Error al activar turno:', err);
      // Mostrar errores de validación del backend
      if (err.response && err.response.data) {
        const errorData = err.response.data;
        if (errorData.non_field_errors) {
          setError(errorData.non_field_errors.join('. '));
        } else if (typeof errorData === 'object') {
          const errorMessages = Object.entries(errorData)
            .map(([field, messages]) => {
              const fieldName = field === 'non_field_errors' ? '' : `${field}: `;
              return `${fieldName}${Array.isArray(messages) ? messages.join(', ') : messages}`;
            })
            .join('. ');
          setError(errorMessages);
        } else {
          setError('Error al activar el turno');
        }
      } else {
        setError('Error al activar el turno');
      }
    } finally {
      setUpdatingId(null);
    }
  };

  // COLUMNAS
  const columns = [
    { field: 'id_turno', label: 'ID', align: 'center' },
    { field: 'paciente', label: 'Paciente', align: 'left', nested: ['nombre', 'apellido'] },
    { field: 'profesional', label: 'Profesional', align: 'left', nested: ['nombre', 'apellido'] },
    { field: 'fecha', label: 'Fecha', align: 'center' },
    { field: 'hora', label: 'Hora', align: 'center' },
    { field: 'estado', label: 'Estado', align: 'center' }
  ];

  // ACCIONES PERSONALIZADAS
  const customActions = [
    {
      icon: updatingId ? <CircularProgress size={18} /> : <CheckCircleIcon fontSize="small" color="success" />,
      title: 'Marcar como Activo',
      onClick: handleActivar,
      condition: (row) => row.estado === 'Pendiente'
    },
    {
      icon: <CancelIcon fontSize="small" color="error" />,
      title: 'Rechazar',
      onClick: async (id) => {
        setUpdatingId(id);
        try {
          // Para cancelar, solo enviamos el estado sin validar disponibilidad
          const turnoActualizado = {
            estado: 'Cancelado'
          };
          await apiClient.patch(`${API_ENDPOINTS.TURNOS}${id}/`, turnoActualizado);
          await fetchTurnosPendientes();
        } catch (err) {
          console.error('Error al cancelar turno:', err);
          setError('Error al cancelar el turno');
        } finally {
          setUpdatingId(null);
        }
      },
      condition: (row) => row.estado === 'Pendiente'
    }
  ];

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Card elevation={3}>
        <CardContent>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
            Solicitudes de Turno Pendientes
          </Typography>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
              <CircularProgress />
            </Box>
          ) : (
            <DynamicTable
              columns={columns}
              data={turnos}
              idField="id_turno"
              emptyMessage="No hay solicitudes de turno pendientes"
              customActions={customActions}
            />
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
