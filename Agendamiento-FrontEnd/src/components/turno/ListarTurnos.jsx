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
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import apiClient from '../../config/apiClient';
import { API_ENDPOINTS } from '../../config/endpoint';
import { TURNO_CONFIG, TURNO_TABLE_COLUMNS } from '../../config/formConfig';
import DynamicTable from '../common/DynamicTable';
import ConfirmDialog from '../common/ConfirmDialog';
import { authService } from '../../services/authService';

export default function ListarTurnos() {
    const navigate = useNavigate();
    const { hasRole } = useAuth();
    const { canPerformAction } = usePermissions();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [confirmDialog, setConfirmDialog] = useState({ open: false, id: null });
    const [showCompleted, setShowCompleted] = useState(false);
    const [pacienteId, setPacienteId] = useState(null);

    const config = TURNO_CONFIG;
    const isPaciente = hasRole('pacientes');
    
    // Verificar permisos
    const canCreate = canPerformAction(MODULES.TURNOS, ACTIONS.CREATE);
    const canEdit = canPerformAction(MODULES.TURNOS, ACTIONS.EDIT);
    const canDelete = canPerformAction(MODULES.TURNOS, ACTIONS.DELETE);

    useEffect(() => {
        fetchData();
    }, [pacienteId]);

    const fetchData = async () => {
        try {
            // Si es paciente y aún no tenemos su ID, obtenerlo primero
            if (isPaciente && !pacienteId) {
                const profile = await authService.getProfile();
                if (profile.perfil_data?.ci) {
                    // Buscar el paciente por cédula
                    const pacientesResponse = await apiClient.get(API_ENDPOINTS.PACIENTES);
                    const paciente = pacientesResponse.data.find(p => p.ci === profile.perfil_data.ci);
                    if (paciente) {
                        const id = paciente.id || paciente.id_paciente;
                        setPacienteId(id);
                        return; // Salir aquí, el useEffect volverá a llamar cuando pacienteId cambie
                    }
                }
            }

            const response = await apiClient.get(API_ENDPOINTS[config.endpoint]);
            let turnos = response.data;

            // Si es paciente, filtrar solo sus turnos
            if (isPaciente && pacienteId) {
                turnos = turnos.filter(turno => 
                    turno.paciente === pacienteId || 
                    turno.paciente?.id === pacienteId || 
                    turno.paciente?.id_paciente === pacienteId
                );
            }

            setData(turnos);
            setError(null);
        } catch (err) {
            setError(`Error al cargar los ${config.entityNamePlural.toLowerCase()}`);
            console.error('Error:', err);
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
            console.error('Error:', err);
            setConfirmDialog({ open: false, id: null });
        }
    };

    const handleEdit = (id) => {
        navigate(`/turnos/editar/${id}`);
    };

    const handleComplete = async (id) => {
        try {
            await apiClient.patch(`${API_ENDPOINTS[config.endpoint]}${id}/`, { estado: 'Completado' });
            // Actualizar el estado local
            setData(data.map(item => 
                item[config.idField] === id 
                    ? { ...item, estado: 'Completado' } 
                    : item
            ));
            setError(null);
        } catch (err) {
            setError('Error al marcar el turno como completado');
            console.error('Error:', err);
        }
    };

    const toggleShowCompleted = () => {
        setShowCompleted(!showCompleted);
    };

    // Filtrar datos según el estado de showCompleted
    let filteredData;
    if (isPaciente) {
        filteredData = showCompleted
            ? data.filter(item => item.estado === 'Completado')
            : data.filter(item => item.estado !== 'Completado');
    } else {
        filteredData = showCompleted
            ? data.filter(item => item.estado === 'Completado')
            : data.filter(item => item.estado !== 'Completado');
    }

    const customActions = canEdit ? [
        {
            icon: <CheckCircleIcon fontSize="small" color="success" />,
            onClick: handleComplete,
            title: 'Marcar como Completado',
            condition: (row) => row.estado !== 'Completado' // Solo mostrar si no está completado
        }
    ] : [];

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
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            {(isPaciente || !isPaciente) && (
                                <Button
                                    variant="outlined"
                                    startIcon={showCompleted ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                    onClick={toggleShowCompleted}
                                    disableRipple
                                    sx={{ '&:hover': { bgcolor: 'transparent' } }}
                                >
                                    {showCompleted ? 'Ocultar Completados' : 'Mostrar Completados'}
                                </Button>
                            )}
                            {canCreate && (
                                <Button
                                    variant="contained"
                                    startIcon={<AddIcon />}
                                    onClick={() => navigate('/turnos/crear')}
                                    disableRipple
                                    disableElevation
                                    sx={{ '&:hover': { bgcolor: 'primary.main', boxShadow: 'none', color: 'inherit' } }}
                                >
                                    {config.createButtonText}
                                </Button>
                            )}
                        </Box>
                    </Box>

                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                    <DynamicTable
                        columns={TURNO_TABLE_COLUMNS}
                        data={filteredData}
                        idField={config.idField}
                        onEdit={canEdit ? handleEdit : null}
                        onDelete={canDelete ? handleDelete : null}
                        emptyMessage={showCompleted ? 'No hay turnos completados' : config.emptyMessage}
                        customActions={customActions}
                    />
                </CardContent>
            </Card>

            <ConfirmDialog
                open={confirmDialog.open}
                onClose={() => setConfirmDialog({ open: false, id: null })}
                onConfirm={confirmDelete}
                title="Eliminar Turno"
                message={config.deleteConfirmMessage}
                confirmText="Eliminar"
                cancelText="Cancelar"
            />
        </Box>
    );
}
