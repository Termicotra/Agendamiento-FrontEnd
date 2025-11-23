import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { usePermissions } from '../../context/PermissionsContext';
import { MODULES, ACTIONS } from '../../config/permissions';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import apiClient from '../../config/apiClient';
import { API_ENDPOINTS } from '../../config/endpoint';
import { HISTORIAL_CONFIG, HISTORIAL_PROFESIONAL_TABLE_COLUMNS } from '../../config/formConfig';
import DynamicTable from '../common/DynamicTable';
import ConfirmDialog from '../common/ConfirmDialog';

export default function HistorialesProfesional() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { canPerformAction } = usePermissions();
  const [historiales, setHistoriales] = useState([]);
  const [profesional, setProfesional] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, id: null });

  const config = HISTORIAL_CONFIG;

  const canView = canPerformAction(MODULES.HISTORIALES_CLINICOS, ACTIONS.VIEW);
  const canEdit = canPerformAction(MODULES.HISTORIALES_CLINICOS, ACTIONS.EDIT);
  const canDelete = canPerformAction(MODULES.HISTORIALES_CLINICOS, ACTIONS.DELETE);

  useEffect(() => {
    if (canView) {
      fetchData();
    }
  }, [id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Cargar datos del profesional
      const profesionalResponse = await apiClient.get(`${API_ENDPOINTS.PROFESIONALES}${id}/`);
      setProfesional(profesionalResponse.data);

      // Cargar todos los historiales y filtrar por profesional
      const historialesResponse = await apiClient.get(API_ENDPOINTS.HISTORIALES_CLINICOS);
      const historialesProfesional = historialesResponse.data.filter(
        h => h.profesional?.id_profesional == id
      );
      setHistoriales(historialesProfesional);
      setError(null);
    } catch (err) {
      setError('Error al cargar los historiales clínicos');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (historialId) => {
    setConfirmDialog({ open: true, id: historialId });
  };

  const confirmDelete = async () => {
    const historialId = confirmDialog.id;
    try {
      await apiClient.delete(`${API_ENDPOINTS[config.endpoint]}${historialId}/`);
      setHistoriales(historiales.filter(h => h[config.idField] !== historialId));
      setError(null);
      setConfirmDialog({ open: false, id: null });
    } catch (err) {
      setError(`Error al eliminar el ${config.entityName.toLowerCase()}`);
      console.error('Error:', err);
      setConfirmDialog({ open: false, id: null });
    }
  };

  const handleEdit = (historialId) => {
    navigate(`/profesionales/${id}/historiales/editar/${historialId}`);
  };

  if (!canView) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">No tienes permisos para ver historiales clínicos</Alert>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 1400, mx: 'auto' }}>
      <Card elevation={3}>
        <CardContent>
          <Box sx={{ mb: 3 }}>
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate('/profesionales')}
              sx={{ mb: 2 }}
            >
              Volver a Profesionales
            </Button>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              {config.title} - {profesional?.nombre} {profesional?.apellido}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Mostrando historiales clínicos donde {profesional?.nombre} {profesional?.apellido} es el profesional asignado
            </Typography>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <DynamicTable
            columns={HISTORIAL_PROFESIONAL_TABLE_COLUMNS}
            data={historiales}
            idField={config.idField}
            onEdit={canEdit ? handleEdit : null}
            onDelete={canDelete ? handleDelete : null}
            emptyMessage={`No hay ${config.entityNamePlural.toLowerCase()} para este profesional`}
          />
        </CardContent>
      </Card>

      <ConfirmDialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog({ open: false, id: null })}
        onConfirm={confirmDelete}
        title={`Eliminar ${config.entityName}`}
        message={config.deleteConfirmMessage}
        confirmText="Eliminar"
        cancelText="Cancelar"
      />
    </Box>
  );
}
