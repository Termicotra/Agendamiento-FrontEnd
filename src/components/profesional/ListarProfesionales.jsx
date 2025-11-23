import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
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
import DescriptionIcon from '@mui/icons-material/Description';
import AssignmentIcon from '@mui/icons-material/Assignment';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import apiClient from '../../config/apiClient';
import { API_ENDPOINTS } from '../../config/endpoint';
import { PROFESIONAL_CONFIG, PROFESIONAL_TABLE_COLUMNS } from '../../config/formConfig';
import DynamicTable from '../common/DynamicTable';
import ConfirmDialog from '../common/ConfirmDialog';

export default function ListarProfesionales() {
    const navigate = useNavigate();
    const { hasRole } = useAuth();
    const { canPerformAction } = usePermissions();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [confirmDialog, setConfirmDialog] = useState({ open: false, id: null });

    const config = PROFESIONAL_CONFIG;
    const isPaciente = hasRole('pacientes');
    
    // Verificar permisos
    const canCreate = canPerformAction(MODULES.PROFESIONALES, ACTIONS.CREATE);
    const canEdit = canPerformAction(MODULES.PROFESIONALES, ACTIONS.EDIT);
    const canDelete = canPerformAction(MODULES.PROFESIONALES, ACTIONS.DELETE);
    const canViewHistoriales = canPerformAction(MODULES.HISTORIALES_CLINICOS, ACTIONS.VIEW);
    const canViewReportes = canPerformAction(MODULES.REPORTES_MEDICOS, ACTIONS.VIEW);
    const canViewDisponibilidad = canPerformAction(MODULES.DISPONIBILIDADES, ACTIONS.VIEW);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const response = await apiClient.get(API_ENDPOINTS[config.endpoint]);
            setData(response.data);
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
        const id = confirmDialog.id;
        try {
            await apiClient.delete(`${API_ENDPOINTS[config.endpoint]}${id}/`);
            setData(data.filter(item => item[config.idField] !== id));
            setError(null);
            setConfirmDialog({ open: false, id: null });
        } catch (err) {
            setError(`Error al eliminar el ${config.entityName.toLowerCase()}`);
            
            setConfirmDialog({ open: false, id: null });
        }
    };

    const handleEdit = (id) => {
        navigate(`/profesionales/editar/${id}`);
    };

    const handleViewHistoriales = (id) => {
        navigate(`/profesionales/${id}/historiales`);
    };

    const handleViewReportes = (id) => {
        navigate(`/profesionales/${id}/reportes`);
    };

    const handleViewDisponibilidad = (id) => {
        navigate(`/profesionales/${id}/disponibilidad`);
    };

    // Construir custom actions basado en permisos
    const customActions = [];
    if (canViewHistoriales && !isPaciente) {
        customActions.push({
            icon: <DescriptionIcon fontSize="small" color="primary" />,
            onClick: handleViewHistoriales,
            title: 'Ver Historiales Clínicos'
        });
    }
    if (canViewReportes) {
        customActions.push({
            icon: <AssignmentIcon fontSize="small" color="secondary" />,
            onClick: handleViewReportes,
            title: 'Ver Reportes Médicos'
        });
    }
    if (canViewDisponibilidad) {
        customActions.push({
            icon: <EventAvailableIcon fontSize="small" color="success" />,
            onClick: handleViewDisponibilidad,
            title: 'Ver Disponibilidad'
        });
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
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                        <Typography variant="h5" component="h2" sx={{ fontWeight: 700 }}>
                            {config.title}
                        </Typography>
                        {canCreate && (
                            <Button
                                variant="contained"
                                startIcon={<AddIcon />}
                                onClick={() => navigate('/profesionales/crear')}
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
                        columns={PROFESIONAL_TABLE_COLUMNS}
                        data={data}
                        idField={config.idField}
                        onEdit={canEdit ? handleEdit : null}
                        onDelete={canDelete ? handleDelete : null}
                        emptyMessage={config.emptyMessage}
                        customActions={customActions}
                    />
                </CardContent>
            </Card>

            <ConfirmDialog
                open={confirmDialog.open}
                onClose={() => setConfirmDialog({ open: false, id: null })}
                onConfirm={confirmDelete}
                title="Eliminar Profesional"
                message={config.deleteConfirmMessage}
                confirmText="Eliminar"
                cancelText="Cancelar"
            />
        </Box>
    );
}

