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
import { REPORTE_CONFIG, REPORTE_TABLE_COLUMNS } from '../../config/formConfig';
import DynamicTable from '../common/DynamicTable';
import ConfirmDialog from '../common/ConfirmDialog';

export default function ReportesProfesional() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { canPerformAction } = usePermissions();
  const [reportes, setReportes] = useState([]);
  const [profesional, setProfesional] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, id: null });

  const config = REPORTE_CONFIG;

  const canView = canPerformAction(MODULES.REPORTES_MEDICOS, ACTIONS.VIEW);
  const canEdit = canPerformAction(MODULES.REPORTES_MEDICOS, ACTIONS.EDIT);
  const canDelete = canPerformAction(MODULES.REPORTES_MEDICOS, ACTIONS.DELETE);

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

      // Cargar todos los reportes y filtrar por profesional
      const reportesResponse = await apiClient.get(API_ENDPOINTS.REPORTES_MEDICOS);
      const reportesProfesional = reportesResponse.data.filter(
        r => r.profesional?.id_profesional == id
      );
      setReportes(reportesProfesional);
      setError(null);
    } catch (err) {
      setError('Error al cargar los reportes médicos');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (reporteId) => {
    setConfirmDialog({ open: true, id: reporteId });
  };

  const confirmDelete = async () => {
    const reporteId = confirmDialog.id;
    try {
      await apiClient.delete(`${API_ENDPOINTS[config.endpoint]}${reporteId}/`);
      setReportes(reportes.filter(r => r[config.idField] !== reporteId));
      setError(null);
      setConfirmDialog({ open: false, id: null });
    } catch (err) {
      setError(`Error al eliminar el ${config.entityName.toLowerCase()}`);
      console.error('Error:', err);
      setConfirmDialog({ open: false, id: null });
    }
  };

  const handleEdit = (reporteId) => {
    navigate(`/profesionales/${id}/reportes/editar/${reporteId}`);
  };

  if (!canView) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">No tienes permisos para ver reportes médicos</Alert>
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
              Mostrando reportes médicos donde {profesional?.nombre} {profesional?.apellido} es el profesional asignado
            </Typography>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <DynamicTable
            columns={REPORTE_TABLE_COLUMNS}
            data={reportes}
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
