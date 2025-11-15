import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Grid from '@mui/material/Grid';
import apiClient from '../../config/apiClient';
import { API_ENDPOINTS } from '../../config/endpoint';
import { DISPONIBILIDAD_CONFIG, DISPONIBILIDAD_FIELDS, DISPONIBILIDAD_TABLE_COLUMNS } from '../../config/formConfig';
import DynamicField from '../common/DynamicField';
import ConfirmDialog from '../common/ConfirmDialog';

export default function DisponibilidadProfesional() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [profesional, setProfesional] = useState(null);
    const [disponibilidad, setDisponibilidad] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [openDialog, setOpenDialog] = useState(false);
    const [editingId, setEditingId] = useState(null);
    
    // Inicializar formData con valores por defecto
    const getInitialFormData = () => {
        const initialData = { ...DISPONIBILIDAD_CONFIG.defaultValues };
        DISPONIBILIDAD_FIELDS.forEach(field => {
            if (!(field.name in initialData)) {
                initialData[field.name] = '';
            }
        });
        return initialData;
    };
    
    const [formData, setFormData] = useState(getInitialFormData());
    const [confirmDialog, setConfirmDialog] = useState({ open: false, id: null });
    const [submitting, setSubmitting] = useState(false);

    const config = DISPONIBILIDAD_CONFIG;

    useEffect(() => {
        fetchData();
    }, [id]);

    const filteredDisponibilidad = useMemo(() => {
        if (!searchTerm.trim()) return disponibilidad;
        return disponibilidad.filter(item => {
            const searchLower = searchTerm.toLowerCase();
            return (
                (item.dia || item.dia_semana || '').toLowerCase().includes(searchLower) ||
                item.hora_inicio?.toLowerCase().includes(searchLower) ||
                item.hora_fin?.toLowerCase().includes(searchLower)
            );
        });
    }, [disponibilidad, searchTerm]);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Cargar datos del profesional
            const profesionalResponse = await apiClient.get(`${API_ENDPOINTS.PROFESIONALES}${id}/`);
            setProfesional(profesionalResponse.data);

            // Cargar disponibilidad del profesional (filtrado por backend)
            const disponibilidadResponse = await apiClient.get(`${API_ENDPOINTS.DISPONIBILIDADES}?profesional=${id}`);
            setDisponibilidad(disponibilidadResponse.data);
            
            setError(null);
        } catch (err) {
            setError('Error al cargar la disponibilidad');
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDialog = (disp = null) => {
        if (disp) {
            // Modo edición
            setEditingId(disp[config.idField]);
            const formValues = { ...getInitialFormData() };
            
            DISPONIBILIDAD_FIELDS.forEach(field => {
                if (disp[field.name] !== undefined && disp[field.name] !== null) {
                    formValues[field.name] = disp[field.name];
                }
            });
            
            setFormData(formValues);
        } else {
            // Modo creación
            setEditingId(null);
            setFormData(getInitialFormData());
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setEditingId(null);
        setError(null);
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);
        
        try {
            const dataToSend = {
                ...formData,
                profesional_id: id
            };

            if (editingId) {
                // Actualizar
                await apiClient.put(`${API_ENDPOINTS[config.endpoint]}${editingId}/`, dataToSend);
            } else {
                // Crear
                await apiClient.post(API_ENDPOINTS[config.endpoint], dataToSend);
            }
            
            await fetchData();
            handleCloseDialog();
        } catch (err) {
            // Manejar errores de validación del backend
            if (err.response?.data) {
                const errorData = err.response.data;
                let errorMessage = '';
                
                // Errores generales (non_field_errors)
                if (errorData.non_field_errors && Array.isArray(errorData.non_field_errors)) {
                    errorMessage = errorData.non_field_errors.join('. ');
                }
                // Errores específicos de campos
                else if (typeof errorData === 'object') {
                    const fieldErrors = Object.entries(errorData)
                        .filter(([key]) => key !== 'detail')
                        .map(([key, value]) => {
                            const fieldLabel = DISPONIBILIDAD_FIELDS.find(f => f.name === key)?.label || key;
                            const errorMsg = Array.isArray(value) ? value.join(', ') : value;
                            return `${fieldLabel}: ${errorMsg}`;
                        });
                    errorMessage = fieldErrors.length > 0 ? fieldErrors.join('. ') : '';
                }
                // Error genérico (detail)
                if (!errorMessage && errorData.detail) {
                    errorMessage = errorData.detail;
                }
                
                setError(errorMessage || `Error al guardar ${config.entityName.toLowerCase()}`);
            } else {
                setError(`Error al guardar ${config.entityName.toLowerCase()}`);
            }
            console.error('Error:', err);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = (dispId) => {
        setConfirmDialog({ open: true, id: dispId });
    };

    const confirmDelete = async () => {
        const dispId = confirmDialog.id;
        try {
            await apiClient.delete(`${API_ENDPOINTS[config.endpoint]}${dispId}/`);
            await fetchData();
            setConfirmDialog({ open: false, id: null });
        } catch (err) {
            setError(`Error al eliminar ${config.entityName.toLowerCase()}`);
            console.error('Error:', err);
            setConfirmDialog({ open: false, id: null });
        }
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
                            {config.title} - Profesional
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button
                                variant="contained"
                                startIcon={<AddIcon />}
                                onClick={() => handleOpenDialog()}
                                disableRipple
                                disableElevation
                                sx={{ '&:hover': { bgcolor: 'primary.main', boxShadow: 'none', color: 'inherit' } }}
                            >
                                {config.createButtonText}
                            </Button>
                            <Button
                                variant="outlined"
                                startIcon={<ArrowBackIcon />}
                                onClick={() => navigate('/profesionales')}
                                disableRipple
                                sx={{ '&:hover': { bgcolor: 'transparent' } }}
                            >
                                Volver
                            </Button>
                        </Box>
                    </Box>

                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                    {profesional && (
                        <Box sx={{ mb: 3, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                            <Typography variant="h6" gutterBottom>
                                Información del Profesional
                            </Typography>
                            <Typography variant="body1">
                                <strong>Nombre:</strong> {profesional.nombre} {profesional.apellido}
                            </Typography>
                            <Typography variant="body1">
                                <strong>CI:</strong> {profesional.ci}
                            </Typography>
                            <Typography variant="body1">
                                <strong>Especialidad:</strong> {profesional.especialidad}
                            </Typography>
                            <Typography variant="body1">
                                <strong>Registro Profesional:</strong> {profesional.registro_profesional}
                            </Typography>
                        </Box>
                    )}

                    <Typography variant="h6" sx={{ mb: 2 }}>
                        Horarios de Disponibilidad
                    </Typography>

                    <Box sx={{ mb: 2 }}>
                        <TextField
                            fullWidth
                            variant="outlined"
                            placeholder={`Buscar en ${config.entityNamePlural.toLowerCase()}...`}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon />
                                    </InputAdornment>
                                ),
                            }}
                            size="small"
                        />
                    </Box>

                    <TableContainer component={Paper} variant="outlined">
                        <Table>
                            <TableHead>
                                <TableRow>
                                    {DISPONIBILIDAD_TABLE_COLUMNS.map((column) => (
                                        <TableCell key={column.field} align={column.align || 'left'}>
                                            <strong>{column.label}</strong>
                                        </TableCell>
                                    ))}
                                    <TableCell align="center"><strong>Acciones</strong></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredDisponibilidad.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={DISPONIBILIDAD_TABLE_COLUMNS.length + 1} align="center">
                                            {searchTerm ? 'No se encontraron resultados' : config.emptyMessage}
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredDisponibilidad.map((disp) => (
                                        <TableRow key={disp[config.idField]}>
                                            {DISPONIBILIDAD_TABLE_COLUMNS.map((column) => (
                                                <TableCell key={column.field} align={column.align || 'left'}>
                                                    {column.field === 'activo' 
                                                        ? (disp[column.field] ? 'Activo' : 'Inactivo')
                                                        : (disp[column.field] || '-')
                                                    }
                                                </TableCell>
                                            ))}
                                            <TableCell align="center">
                                                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleOpenDialog(disp)}
                                                        disableRipple
                                                        sx={{ '&:hover': { bgcolor: 'transparent' } }}
                                                        title="Editar"
                                                    >
                                                        <EditIcon fontSize="small" color="primary" />
                                                    </IconButton>
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleDelete(disp[config.idField])}
                                                        disableRipple
                                                        sx={{ '&:hover': { bgcolor: 'transparent' } }}
                                                        title="Eliminar"
                                                    >
                                                        <DeleteIcon fontSize="small" color="error" />
                                                    </IconButton>
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </CardContent>
            </Card>

            {/* Diálogo para crear/editar disponibilidad */}
            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle>
                    {editingId ? config.editTitle : config.createTitle}
                </DialogTitle>
                <form onSubmit={handleSubmit}>
                    <DialogContent>
                        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                        
                        <Grid container spacing={2}>
                            {DISPONIBILIDAD_FIELDS.map((field) => (
                                <DynamicField
                                    key={field.name}
                                    field={field}
                                    value={formData[field.name]}
                                    onChange={handleChange}
                                    disabled={submitting}
                                    options={field.options}
                                />
                            ))}
                        </Grid>
                    </DialogContent>
                    <DialogActions>
                        <Button 
                            onClick={handleCloseDialog} 
                            disabled={submitting}
                            disableRipple
                            sx={{ '&:hover': { bgcolor: 'transparent' } }}
                        >
                            Cancelar
                        </Button>
                        <Button 
                            type="submit" 
                            variant="contained" 
                            disabled={submitting}
                            disableRipple
                            disableElevation
                            sx={{ '&:hover': { bgcolor: 'primary.main', boxShadow: 'none', color: 'inherit' } }}
                        >
                            {submitting ? <CircularProgress size={24} /> : (editingId ? 'Actualizar' : 'Crear')}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>

            {/* Diálogo de confirmación para eliminar */}
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
