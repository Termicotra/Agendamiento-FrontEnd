import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';
import apiClient from '../../config/apiClient';
import { API_ENDPOINTS } from '../../config/endpoint';
import { TURNO_CONFIG, TURNO_FIELDS } from '../../config/formConfig';
import DynamicField from '../common/DynamicField';
import { authService } from '../../services/authService';

export default function FormularioTurno() {
    const navigate = useNavigate();
    const { id } = useParams();
    const { hasRole } = useAuth();
    const isEdit = Boolean(id);
    const isPaciente = hasRole('pacientes');

    const config = TURNO_CONFIG;
    
    // Inicializar formData con valores por defecto de todos los campos
    const getInitialFormData = () => {
        const initialData = { ...config.defaultValues };
        TURNO_FIELDS.forEach(field => {
            if (!(field.name in initialData)) {
                initialData[field.name] = '';
            }
        });
        return initialData;
    };

    const [formData, setFormData] = useState(getInitialFormData());
    const [fieldOptions, setFieldOptions] = useState({});
    const [optionsLoaded, setOptionsLoaded] = useState(false);
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(isEdit);
    const [error, setError] = useState('');
    const [especialidadSeleccionada, setEspecialidadSeleccionada] = useState('');
    const [especialidadesDisponibles, setEspecialidadesDisponibles] = useState([]);
    const [todosLosProfesionales, setTodosLosProfesionales] = useState([]);

    useEffect(() => {
        const initialize = async () => {
            // Primero cargar las opciones, luego los datos
            await loadFieldOptions();
            
            // Si es paciente, auto-completar el campo paciente
            if (isPaciente && !isEdit) {
                await autoCompletarPaciente();
            }
            
            if (isEdit) {
                await fetchData();
            }
        };
        initialize();
    }, [id]);

    // Prevenir que se renderice el formulario hasta que las opciones estén cargadas en modo edición
    const shouldShowForm = !isEdit || (isEdit && optionsLoaded && !loadingData);

    const loadFieldOptions = async () => {
        try {
            const optionsToLoad = TURNO_FIELDS.filter(field => field.endpoint);
            const promises = optionsToLoad.map(async (field) => {
                try {
                    const response = await apiClient.get(API_ENDPOINTS[field.endpoint]);
                    
                    // Guardar todos los profesionales para filtrado posterior
                    if (field.name === 'profesional_id') {
                        setTodosLosProfesionales(response.data);
                        
                        // Extraer especialidades únicas
                        const especialidades = [...new Set(
                            response.data
                                .map(prof => prof.especialidad)
                                .filter(Boolean)
                        )].sort();
                        setEspecialidadesDisponibles(especialidades);
                    }
                    
                    return {
                        fieldName: field.name,
                        options: response.data.map(item => ({
                            value: item[field.idField],
                            label: field.displayFields.map(f => item[f]).filter(Boolean).join(' ')
                        }))
                    };
                } catch (err) {
                    console.error(`Error loading ${field.name}:`, err);
                    return { fieldName: field.name, options: [] };
                }
            });

            const results = await Promise.all(promises);
            const optionsMap = {};
            results.forEach(({ fieldName, options }) => {
                optionsMap[fieldName] = options;
            });
            setFieldOptions(optionsMap);
            setOptionsLoaded(true);
        } catch (err) {
            console.error('Error loading options:', err);
            setOptionsLoaded(true); // Marcar como cargado incluso si hay error
        }
    };

    const autoCompletarPaciente = async () => {
        try {
            const profile = await authService.getProfile();
            if (profile.perfil_data?.ci) {
                const pacientesResponse = await apiClient.get(API_ENDPOINTS.PACIENTES);
                const paciente = pacientesResponse.data.find(p => p.ci === profile.perfil_data.ci);
                if (paciente) {
                    const pacienteId = paciente.id || paciente.id_paciente;
                    setFormData(prev => ({
                        ...prev,
                        paciente_id: pacienteId
                    }));
                }
            }
        } catch (err) {
            console.error('Error al auto-completar paciente:', err);
        }
    };

    const fetchData = async () => {
        setLoadingData(true);
        try {
            const response = await apiClient.get(`${API_ENDPOINTS[config.endpoint]}${id}/`);
            const data = response.data;
            const formValues = { ...getInitialFormData() };
            
            TURNO_FIELDS.forEach(field => {
                // Manejar campos que son relaciones (terminan en _id)
                if (field.name.endsWith('_id')) {
                    const baseFieldName = field.name.replace('_id', '');
                    // Si el dato viene como objeto (paciente: {id_paciente: 1}), extraer el ID
                    if (data[baseFieldName] && typeof data[baseFieldName] === 'object') {
                        formValues[field.name] = data[baseFieldName][field.idField];
                    } 
                    // Si el dato viene directamente como ID (paciente_id: 1)
                    else if (data[field.name] !== undefined && data[field.name] !== null) {
                        formValues[field.name] = data[field.name];
                    }
                } 
                // Manejar campos normales
                else if (data[field.name] !== undefined && data[field.name] !== null) {
                    formValues[field.name] = data[field.name];
                }
            });
            
            setFormData(formValues);
        } catch (err) {
            setError(`Error al cargar el ${config.entityName.toLowerCase()}`);
            console.error('Error:', err);
        } finally {
            setLoadingData(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        
        // Manejar cambio de especialidad
        if (name === 'especialidad') {
            setEspecialidadSeleccionada(value);
            // Limpiar selección de profesional cuando cambia la especialidad
            setFormData({
                ...formData,
                profesional_id: ''
            });
            setError('');
            return;
        }
        
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
        setError('');
    };

    // Obtener opciones de profesionales filtradas por especialidad
    const getProfesionalesFiltrados = () => {
        if (!especialidadSeleccionada) {
            return fieldOptions.profesional_id || [];
        }
        
        const profesionalesFiltrados = todosLosProfesionales
            .filter(prof => prof.especialidad === especialidadSeleccionada)
            .map(prof => ({
                value: prof.id_profesional,
                label: `${prof.nombre} ${prof.apellido} - ${prof.especialidad}`
            }));
        
        return profesionalesFiltrados;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            let dataToSend = { ...formData };
            if (!isEdit && isPaciente) {
                dataToSend = {
                    ...formData,
                    empleado_id: 2
                };
            }
            if (isEdit) {
                await apiClient.put(`${API_ENDPOINTS[config.endpoint]}${id}/`, dataToSend);
            } else {
                await apiClient.post(API_ENDPOINTS[config.endpoint], dataToSend);
            }
            navigate('/turnos');
        } catch (err) {
            // Manejar errores de validación del backend
            if (err.response?.data) {
                const errorData = err.response.data;
                let errorMessage = '';
                
                // Errores generales (non_field_errors) - incluye validación de turnos duplicados
                if (errorData.non_field_errors && Array.isArray(errorData.non_field_errors)) {
                    errorMessage = errorData.non_field_errors.join('. ');
                }
                // Errores específicos de campos
                else if (typeof errorData === 'object' && !errorData.detail) {
                    const fieldErrors = Object.entries(errorData)
                        .map(([key, value]) => {
                            if (key === 'non_field_errors') {
                                return Array.isArray(value) ? value.join('. ') : value;
                            }
                            const fieldLabel = TURNO_FIELDS.find(f => f.name === key)?.label || key;
                            const errorMsg = Array.isArray(value) ? value.join(', ') : value;
                            return `${fieldLabel}: ${errorMsg}`;
                        });
                    errorMessage = fieldErrors.join('. ');
                }
                // Error genérico (detail)
                if (!errorMessage && errorData.detail) {
                    errorMessage = errorData.detail;
                }
                
                setError(errorMessage || `Error al guardar el ${config.entityName.toLowerCase()}`);
            } else {
                setError(`Error al guardar el ${config.entityName.toLowerCase()}`);
            }
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
            <Card elevation={3}>
                <CardContent>
                    <Typography variant="h5" component="h2" sx={{ fontWeight: 700, mb: 3 }}>
                        {isEdit ? config.editTitle : config.createTitle}
                    </Typography>

                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                    {(loadingData || !optionsLoaded) ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
                            <CircularProgress />
                        </Box>
                    ) : (
                        <Box component="form" onSubmit={handleSubmit}>
                            <Grid container spacing={3}>
                                {/* Campo paciente */}
                                {TURNO_FIELDS.filter(f => f.name === 'paciente_id').map((field) => {
                                    let isDisabled = loading;
                                    if (isPaciente) isDisabled = true;
                                    let fieldOptionsToUse = field.options || fieldOptions[field.name];
                                    return (
                                        <DynamicField
                                            key={field.name}
                                            field={field}
                                            value={formData[field.name]}
                                            onChange={handleChange}
                                            disabled={isDisabled}
                                            options={fieldOptionsToUse}
                                        />
                                    );
                                })}
                                {/* Campo especialidad para filtrar profesionales */}
                                <Grid item xs={12} sm={6}>
                                    <DynamicField
                                        field={{
                                            name: 'especialidad',
                                            label: 'Especialidad',
                                            type: 'select',
                                            required: false,
                                            grid: { xs: 12, sm: 6 },
                                            options: especialidadesDisponibles.map(esp => ({
                                                value: esp,
                                                label: esp
                                            }))
                                        }}
                                        value={especialidadSeleccionada}
                                        onChange={handleChange}
                                        disabled={loading}
                                        options={especialidadesDisponibles.map(esp => ({
                                            value: esp,
                                            label: esp
                                        }))}
                                    />
                                </Grid>
                                {/* El resto de los campos, ocultando empleado_id, estado y modalidad para pacientes */}
                                {TURNO_FIELDS.filter(f => f.name !== 'paciente_id').map((field) => {
                                    if (isPaciente && ['empleado_id', 'estado', 'modalidad'].includes(field.name)) {
                                        return null;
                                    }
                                    let isDisabled = loading;
                                    if (field.name === 'profesional_id' && !especialidadSeleccionada) {
                                        isDisabled = true;
                                    }
                                    let fieldOptionsToUse = field.options || fieldOptions[field.name];
                                    if (field.name === 'profesional_id') {
                                        fieldOptionsToUse = getProfesionalesFiltrados();
                                    }
                                    return (
                                        <DynamicField
                                            key={field.name}
                                            field={field}
                                            value={formData[field.name]}
                                            onChange={handleChange}
                                            disabled={isDisabled}
                                            options={fieldOptionsToUse}
                                        />
                                    );
                                })}
                            </Grid>

                            <CardActions sx={{ justifyContent: 'flex-end', gap: 1, mt: 3, px: 0 }}>
                                <Button
                                    variant="outlined"
                                    onClick={() => navigate('/turnos')}
                                    disabled={loading}
                                    disableRipple
                                    sx={{ '&:hover': { bgcolor: 'transparent' } }}
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    disabled={loading}
                                    disableRipple
                                    disableElevation
                                    sx={{ '&:hover': { bgcolor: 'primary.main', boxShadow: 'none', color: 'inherit' } }}
                                >
                                    {loading ? <CircularProgress size={24} /> : (isEdit ? 'Actualizar' : 'Crear')}
                                </Button>
                            </CardActions>
                        </Box>
                    )}
                </CardContent>
            </Card>
        </Box>
    );
}
