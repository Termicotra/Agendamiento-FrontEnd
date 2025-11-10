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
import apiClient from '../../config/apiClient';
import { API_ENDPOINTS } from '../../config/endpoint';

export default function HistorialesProfesional() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [profesional, setProfesional] = useState(null);
    const [historiales, setHistoriales] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchData();
    }, [id]);

    const filteredHistoriales = useMemo(() => {
        if (!searchTerm.trim()) return historiales;
        return historiales.filter(item => {
            const searchLower = searchTerm.toLowerCase();
            return (
                item.fecha?.toLowerCase().includes(searchLower) ||
                item.hora?.toLowerCase().includes(searchLower) ||
                item.razon?.toLowerCase().includes(searchLower) ||
                item.descripcion?.toLowerCase().includes(searchLower) ||
                (item.paciente?.nombre + ' ' + item.paciente?.apellido)?.toLowerCase().includes(searchLower)
            );
        });
    }, [historiales, searchTerm]);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Cargar datos del profesional
            const profesionalResponse = await apiClient.get(`${API_ENDPOINTS.PROFESIONALES}${id}/`);
            setProfesional(profesionalResponse.data);

            // Cargar historiales del profesional
            const historialesResponse = await apiClient.get(`${API_ENDPOINTS.HISTORIALES_CLINICOS}?profesional=${id}`);
            setHistoriales(historialesResponse.data);
            
            setError(null);
        } catch (err) {
            setError('Error al cargar los historiales clínicos');
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
                            Historiales Clínicos del Profesional
                        </Typography>
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
                        Registros de Historiales Clínicos
                    </Typography>

                    <Box sx={{ mb: 2 }}>
                        <TextField
                            fullWidth
                            variant="outlined"
                            placeholder="Buscar en historiales..."
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
                                    <TableCell><strong>Paciente</strong></TableCell>
                                    <TableCell><strong>Razón</strong></TableCell>
                                    <TableCell><strong>Descripción</strong></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredHistoriales.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} align="center">
                                            {searchTerm ? 'No se encontraron resultados' : 'No hay historiales clínicos registrados'}
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredHistoriales.map((historial) => (
                                        <TableRow key={historial.id_historial}>
                                            <TableCell>{historial.id_historial}</TableCell>
                                            <TableCell>{historial.fecha || '-'}</TableCell>
                                            <TableCell>{historial.hora || '-'}</TableCell>
                                            <TableCell>
                                                {historial.paciente 
                                                    ? `${historial.paciente.nombre} ${historial.paciente.apellido}`
                                                    : '-'
                                                }
                                            </TableCell>
                                            <TableCell>{historial.razon || '-'}</TableCell>
                                            <TableCell>{historial.descripcion || '-'}</TableCell>
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
