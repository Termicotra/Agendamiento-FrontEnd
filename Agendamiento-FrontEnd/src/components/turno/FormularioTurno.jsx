import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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

export default function FormularioTurno() {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEdit = Boolean(id);

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

    useEffect(() => {
        const initialize = async () => {
            // Primero cargar las opciones, luego los datos
            await loadFieldOptions();
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
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            if (isEdit) {
                await apiClient.put(`${API_ENDPOINTS[config.endpoint]}${id}/`, formData);
            } else {
                await apiClient.post(API_ENDPOINTS[config.endpoint], formData);
            }
            navigate('/turnos');
        } catch (err) {
            setError(err.response?.data?.detail || `Error al guardar el ${config.entityName.toLowerCase()}`);
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
                                {TURNO_FIELDS.map((field) => (
                                    <DynamicField
                                        key={field.name}
                                        field={field}
                                        value={formData[field.name]}
                                        onChange={handleChange}
                                        disabled={loading}
                                        options={field.options || fieldOptions[field.name]}
                                    />
                                ))}
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
