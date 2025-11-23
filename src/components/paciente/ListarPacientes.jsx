import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
import FolderSharedIcon from '@mui/icons-material/FolderShared';
import AssessmentIcon from '@mui/icons-material/Assessment';
import apiClient from '../../config/apiClient';
import { API_ENDPOINTS } from '../../config/endpoint';
import { PACIENTE_CONFIG, PACIENTE_TABLE_COLUMNS } from '../../config/formConfig';
import DynamicTable from '../common/DynamicTable';
import ConfirmDialog from '../common/ConfirmDialog';

export default function ListarPacientes() {
    const navigate = useNavigate();
    const { canPerformAction } = usePermissions();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [confirmDialog, setConfirmDialog] = useState({ open: false, id: null });

    const config = PACIENTE_CONFIG;
    
    // Verificar permisos
    const canCreate = canPerformAction(MODULES.PACIENTES, ACTIONS.CREATE);
    const canEdit = canPerformAction(MODULES.PACIENTES, ACTIONS.EDIT);
    const canDelete = canPerformAction(MODULES.PACIENTES, ACTIONS.DELETE);
    const canViewHistorial = canPerformAction(MODULES.HISTORIALES_CLINICOS, ACTIONS.VIEW);
    const canViewReporte = canPerformAction(MODULES.REPORTES_MEDICOS, ACTIONS.VIEW);

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
        navigate(`/pacientes/editar/${id}`);
    };

    const handleViewHistorial = (id) => {
        navigate(`/pacientes/${id}/historiales`);
    };

    const handleViewReportes = (id) => {
        navigate(`/pacientes/${id}/reportes`);
    };

    const customActions = [];
    
    if (canViewHistorial) {
        customActions.push({
            icon: <FolderSharedIcon fontSize="small" color="primary" />,
            onClick: handleViewHistorial,
            title: 'Ver Historiales Clínicos'
        });
    }
    
    if (canViewReporte) {
        customActions.push({
            icon: <AssessmentIcon fontSize="small" color="secondary" />,
            onClick: handleViewReportes,
            title: 'Ver Reportes Médicos'
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
                                onClick={() => navigate('/pacientes/crear')}
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
                        columns={PACIENTE_TABLE_COLUMNS}
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
                title="Eliminar Paciente"
                message={config.deleteConfirmMessage}
                confirmText="Eliminar"
                cancelText="Cancelar"
            />
        </Box>
    );
}

