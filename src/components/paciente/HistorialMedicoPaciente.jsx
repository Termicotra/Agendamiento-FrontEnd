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
import Chip from '@mui/material/Chip';
import apiClient from '../../config/apiClient';
import { API_ENDPOINTS } from '../../config/endpoint';

export default function HistorialMedicoPaciente() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [paciente, setPaciente] = useState(null);
    const [historial, setHistorial] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchData();
    }, [id]);

    const filteredHistorial = useMemo(() => {
        if (!searchTerm.trim()) return historial;
        return historial.filter(item => {
            const searchLower = searchTerm.toLowerCase();
            return (
                item.fecha?.toLowerCase().includes(searchLower) ||
                item.hora?.toLowerCase().includes(searchLower) ||
                item.razon?.toLowerCase().includes(searchLower) ||
                item.descripcion?.toLowerCase().includes(searchLower) ||
                (item.profesional?.nombre + ' ' + item.profesional?.apellido)?.toLowerCase().includes(searchLower)
            );
        });
    }, [historial, searchTerm]);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Cargar datos del paciente
            const pacienteResponse = await apiClient.get(`${API_ENDPOINTS.PACIENTES}${id}/`);
            setPaciente(pacienteResponse.data);

            // Cargar historial clínico del paciente
            const historialResponse = await apiClient.get(`${API_ENDPOINTS.HISTORIALES_CLINICOS}?paciente=${id}`);
            setHistorial(historialResponse.data);
            
            setError(null);
        } catch (err) {
            setError('Error al cargar el historial médico');
            console.error('Error:', err);
        } finally {
            setLoading(false);
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
                            Historial Médico
                        </Typography>
                        <Button
                            variant="outlined"
                            startIcon={<ArrowBackIcon />}
                            onClick={() => navigate('/pacientes')}
                            disableRipple
                            sx={{ '&:hover': { bgcolor: 'transparent' } }}
                        >
                            Volver
                        </Button>
                    </Box>

                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                    {paciente && (
                        <Box sx={{ mb: 3, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                            <Typography variant="h6" gutterBottom>
                                Información del Paciente
                            </Typography>
                            <Typography variant="body1">
                                <strong>Nombre:</strong> {paciente.nombre} {paciente.apellido}
                            </Typography>
                            <Typography variant="body1">
                                <strong>CI:</strong> {paciente.ci}
                            </Typography>
                            <Typography variant="body1">
                                <strong>Fecha de Nacimiento:</strong> {paciente.fecha_nacimiento}
                            </Typography>
                            <Typography variant="body1">
                                <strong>Teléfono:</strong> {paciente.telefono}
                            </Typography>
                        </Box>
                    )}

                    <Typography variant="h6" sx={{ mb: 2 }}>
                        Registros del Historial Clínico
                    </Typography>

                    <Box sx={{ mb: 2 }}>
                        <TextField
                            fullWidth
                            variant="outlined"
                            placeholder="Buscar en el historial..."
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
                                    <TableCell><strong>ID</strong></TableCell>
                                    <TableCell><strong>Fecha</strong></TableCell>
                                    <TableCell><strong>Hora</strong></TableCell>
                                    <TableCell><strong>Razón</strong></TableCell>
                                    <TableCell><strong>Descripción</strong></TableCell>
                                    <TableCell><strong>Profesional</strong></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredHistorial.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} align="center">
                                            {searchTerm ? 'No se encontraron resultados' : 'No hay registros en el historial clínico'}
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredHistorial.map((registro) => (
                                        <TableRow key={registro.id_historial}>
                                            <TableCell>{registro.id_historial}</TableCell>
                                            <TableCell>{registro.fecha || '-'}</TableCell>
                                            <TableCell>{registro.hora || '-'}</TableCell>
                                            <TableCell>{registro.razon || '-'}</TableCell>
                                            <TableCell>{registro.descripcion || '-'}</TableCell>
                                            <TableCell>
                                                {registro.profesional 
                                                    ? `${registro.profesional.nombre} ${registro.profesional.apellido} - ${registro.profesional.especialidad}`
                                                    : '-'
                                                }
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </CardContent>
            </Card>
        </Box>
    );
}
