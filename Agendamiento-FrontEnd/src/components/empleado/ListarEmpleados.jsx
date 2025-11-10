import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import AddIcon from '@mui/icons-material/Add';
import apiClient from '../../config/apiClient';
import { API_ENDPOINTS } from '../../config/endpoint';
import { EMPLEADO_CONFIG, EMPLEADO_TABLE_COLUMNS } from '../../config/formConfig';
import DynamicTable from '../common/DynamicTable';
import ConfirmDialog from '../common/ConfirmDialog';

export default function ListarEmpleados() {
    const navigate = useNavigate();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [confirmDialog, setConfirmDialog] = useState({ open: false, id: null });

    const config = EMPLEADO_CONFIG;

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
        navigate(`/empleados/editar/${id}`);
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
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                        <Typography variant="h5" component="h2" sx={{ fontWeight: 700 }}>
                            {config.title}
                        </Typography>
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={() => navigate('/empleados/crear')}
                            disableRipple
                            disableElevation
                            sx={{ '&:hover': { bgcolor: 'primary.main', boxShadow: 'none', color: 'inherit' } }}
                        >
                            {config.createButtonText}
                        </Button>
                    </Box>

                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                    <DynamicTable
                        columns={EMPLEADO_TABLE_COLUMNS}
                        data={data}
                        idField={config.idField}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        emptyMessage={config.emptyMessage}
                    />
                </CardContent>
            </Card>

            <ConfirmDialog
                open={confirmDialog.open}
                onClose={() => setConfirmDialog({ open: false, id: null })}
                onConfirm={confirmDelete}
                title="Eliminar Empleado"
                message={config.deleteConfirmMessage}
                confirmText="Eliminar"
                cancelText="Cancelar"
            />
        </Box>
    );
}
