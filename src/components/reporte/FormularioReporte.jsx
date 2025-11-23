import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';
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
import { REPORTE_CONFIG, REPORTE_FIELDS } from '../../config/formConfig';
import DynamicField from '../common/DynamicField';

export default function FormularioReporte() {
  const { id: entityId, reporteId } = useParams(); // entityId puede ser pacienteId o profesionalId
  const navigate = useNavigate();
  const location = useLocation();
  const { hasRole } = useAuth();
  const [formData, setFormData] = useState(REPORTE_CONFIG.defaultValues);
  const [fieldOptions, setFieldOptions] = useState({});
  const [optionsLoaded, setOptionsLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [currentProfesionalId, setCurrentProfesionalId] = useState(null);

  const config = REPORTE_CONFIG;
  const isEditMode = !!reporteId;
  
  // Detectar si viene de pacientes o profesionales basándose en la URL
  const isPacienteContext = location.pathname.includes('/pacientes/');
  const isProfesionalContext = location.pathname.includes('/profesionales/');

  useEffect(() => {
    const initialize = async () => {
      await loadFieldOptions();
      
      // Si el usuario es profesional, obtener su ID de profesional
      if (hasRole('profesionales')) {
        await loadCurrentProfesional();
      }
      
      // Auto-completar el campo según el contexto
      if (isPacienteContext && entityId) {
        setFormData(prev => ({ ...prev, paciente_id: parseInt(entityId) }));
      } else if (isProfesionalContext && entityId) {
        setFormData(prev => ({ ...prev, profesional_id: parseInt(entityId) }));
      }
      
      if (isEditMode) {
        await fetchReporte();
      }
    };
    initialize();
  }, [reporteId, entityId]);

  const loadCurrentProfesional = async () => {
    try {
      // Obtener el perfil del usuario autenticado
      const profile = await authService.getProfile();
      console.log('Profile loaded:', profile);
      if (profile.perfil_data?.id_profesional) {
        const profesionalId = profile.perfil_data.id_profesional;
        console.log('Setting current profesional ID:', profesionalId);
        setCurrentProfesionalId(profesionalId);
        // Auto-completar el campo profesional con el profesional actual
        setFormData(prev => {
          console.log('Setting formData profesional_id to:', profesionalId);
          return { ...prev, profesional_id: profesionalId };
        });
      } else {
        console.log('No id_profesional found in perfil_data');
      }
    } catch (err) {
      console.error('Error loading current profesional:', err);
    }
  };

  const loadFieldOptions = async () => {
    try {
      const optionsToLoad = REPORTE_FIELDS.filter(field => field.endpoint);
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
      setOptionsLoaded(true);
    }
  };

  const fetchReporte = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get(`${API_ENDPOINTS[config.endpoint]}${reporteId}/`);
      const data = response.data;
      
      // Extraer IDs correctamente del objeto anidado o del ID directo
      const pacienteId = typeof data.paciente === 'object' && data.paciente !== null 
        ? data.paciente.id_paciente 
        : data.paciente;
      
      const profesionalId = typeof data.profesional === 'object' && data.profesional !== null 
        ? data.profesional.id_profesional 
        : data.profesional;
      
      setFormData({
        paciente_id: pacienteId,
        profesional_id: profesionalId,
        fecha: data.fecha,
        descripcion: data.descripcion
      });
    } catch (err) {
      setError(`Error al cargar el ${config.entityName.toLowerCase()}`);
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleChangeEvent = (e) => {
    const { name, value } = e.target;
    handleChange(name, value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isEditMode) {
        await apiClient.put(`${API_ENDPOINTS[config.endpoint]}${reporteId}/`, formData);
      } else {
        await apiClient.post(API_ENDPOINTS[config.endpoint], formData);
      }
      setSuccess(true);
      setTimeout(() => {
        if (isPacienteContext) {
          navigate(`/pacientes/${entityId}/reportes`);
        } else if (isProfesionalContext) {
          navigate(`/profesionales/${entityId}/reportes`);
        }
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || `Error al ${isEditMode ? 'actualizar' : 'crear'} el ${config.entityName.toLowerCase()}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditMode && !optionsLoaded) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Card elevation={3}>
        <CardContent>
          <Box sx={{ mb: 2 }}>
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => {
                if (isPacienteContext) {
                  navigate(`/pacientes/${entityId}/reportes`);
                } else if (isProfesionalContext) {
                  navigate(`/profesionales/${entityId}/reportes`);
                }
              }}
              sx={{ mb: 2 }}
            >
              Volver
            </Button>
          </Box>

          <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
            {isEditMode ? config.editTitle : config.createTitle}
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>
            {config.entityName} {isEditMode ? 'actualizado' : 'creado'} exitosamente
          </Alert>}

          <Box component="form" onSubmit={handleSubmit}>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 2 }}>
              {REPORTE_FIELDS.map(field => {
                const fieldOptionsToUse = field.options || fieldOptions[field.name];
                const isDisabled = (field.name === 'paciente_id' && isPacienteContext) ||
                                   (field.name === 'profesional_id' && (isProfesionalContext || (hasRole('profesionales') && currentProfesionalId)));
                
                // Debug logging
                if (field.name === 'profesional_id') {
                  console.log('Profesional field:', {
                    isProfesionalContext,
                    hasRoleProfesionales: hasRole('profesionales'),
                    currentProfesionalId,
                    isDisabled,
                    formDataValue: formData[field.name]
                  });
                }
                
                return (
                  <Box
                    key={field.name}
                    sx={{
                      gridColumn: `span ${field.grid?.xs || 12}`,
                      '@media (min-width: 600px)': {
                        gridColumn: `span ${field.grid?.sm || field.grid?.xs || 12}`
                      }
                    }}
                  >
                    <DynamicField
                      field={field}
                      value={formData[field.name] || ''}
                      onChange={handleChangeEvent}
                      disabled={isDisabled}
                      options={fieldOptionsToUse}
                    />
                  </Box>
                );
              })}
            </Box>

            <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                fullWidth
              >
                {loading ? <CircularProgress size={24} /> : (isEditMode ? 'Actualizar' : 'Crear')}
              </Button>
              <Button
                variant="outlined"
                onClick={() => {
                  if (isPacienteContext) {
                    navigate(`/pacientes/${entityId}/reportes`);
                  } else if (isProfesionalContext) {
                    navigate(`/profesionales/${entityId}/reportes`);
                  }
                }}
                fullWidth
              >
                Cancelar
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
