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
import AddIcon from '@mui/icons-material/Add';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import apiClient from '../../config/apiClient';
import { API_ENDPOINTS } from '../../config/endpoint';
import { HISTORIAL_CONFIG, HISTORIAL_TABLE_COLUMNS } from '../../config/formConfig';
import DynamicTable from '../common/DynamicTable';
import ConfirmDialog from '../common/ConfirmDialog';

export default function HistorialesPaciente() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { canPerformAction } = usePermissions();
  const [data, setData] = useState([]);
  const [paciente, setPaciente] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, id: null });

  const config = HISTORIAL_CONFIG;
  
  // Verificar permisos
  const canCreate = canPerformAction(MODULES.HISTORIALES_CLINICOS, ACTIONS.CREATE);
  const canEdit = canPerformAction(MODULES.HISTORIALES_CLINICOS, ACTIONS.EDIT);
  const canDelete = canPerformAction(MODULES.HISTORIALES_CLINICOS, ACTIONS.DELETE);

  useEffect(() => {
    fetchData();
    fetchPaciente();
  }, [id]);

  const fetchPaciente = async () => {
    try {
      const response = await apiClient.get(`${API_ENDPOINTS.PACIENTES}${id}/`);
      setPaciente(response.data);
    } catch {
      // Error silenciado
    }
  };

  const fetchData = async () => {
    try {
      const response = await apiClient.get(API_ENDPOINTS[config.endpoint]);
      // Filtrar solo los historiales de este paciente
      const historialesPaciente = response.data.filter(
        h => h.paciente?.id_paciente == id || h.paciente == id
      );
      setData(historialesPaciente);
      setError(null);
    } catch (err) {
      setError(`Error al cargar los ${config.entityNamePlural.toLowerCase()}`);
      
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    setConfirmDialog({ open: true, id });
  };

  const confirmDelete = async () => {
    const historialId = confirmDialog.id;
    try {
      await apiClient.delete(`${API_ENDPOINTS[config.endpoint]}${historialId}/`);
      setData(data.filter(item => item[config.idField] !== historialId));
      setError(null);
      setConfirmDialog({ open: false, id: null });
    } catch (err) {
      setError(`Error al eliminar el ${config.entityName.toLowerCase()}`);
      
      setConfirmDialog({ open: false, id: null });
    }
  };

  const handleEdit = (historialId) => {
    navigate(`/pacientes/${id}/historiales/editar/${historialId}`);
  };

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
          <Box sx={{ mb: 2 }}>
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate('/pacientes')}
              sx={{ mb: 2 }}
            >
              Volver a Pacientes
            </Button>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Box>
              <Typography variant="h5" component="h2" sx={{ fontWeight: 700 }}>
                {config.title}
              </Typography>
              {paciente && (
                <Typography variant="subtitle1" color="text.secondary">
                  Paciente: {paciente.nombre} {paciente.apellido} - CI: {paciente.ci}
                </Typography>
              )}
            </Box>
            {canCreate && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => navigate(`/pacientes/${id}/historiales/crear`)}
                disableRipple
                disableElevation
                sx={{ '&:hover': { bgcolor: 'primary.main', boxShadow: 'none', color: 'inherit' } }}
              >
                {config.createButtonText}
              </Button>
            )}
          </Box>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <DynamicTable
            columns={HISTORIAL_TABLE_COLUMNS}
            data={data}
            idField={config.idField}
            onEdit={canEdit ? handleEdit : null}
            onDelete={canDelete ? handleDelete : null}
            emptyMessage={config.emptyMessage}
          />
        </CardContent>
      </Card>

      <ConfirmDialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog({ open: false, id: null })}
        onConfirm={confirmDelete}
        title="Eliminar Historial Clínico"
        message={config.deleteConfirmMessage}
        confirmText="Eliminar"
        cancelText="Cancelar"
      />
    </Box>
  );
}

