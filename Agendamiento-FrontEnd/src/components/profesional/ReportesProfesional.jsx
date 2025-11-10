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

export default function ReportesProfesional() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [profesional, setProfesional] = useState(null);
    const [reportes, setReportes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchData();
    }, [id]);

    const filteredReportes = useMemo(() => {
        if (!searchTerm.trim()) return reportes;
        return reportes.filter(item => {
            const searchLower = searchTerm.toLowerCase();
            return (
                item.fecha?.toLowerCase().includes(searchLower) ||
                item.diagnostico?.toLowerCase().includes(searchLower) ||
                item.tratamiento?.toLowerCase().includes(searchLower) ||
                item.observaciones?.toLowerCase().includes(searchLower) ||
                (item.paciente?.nombre + ' ' + item.paciente?.apellido)?.toLowerCase().includes(searchLower)
            );
        });
    }, [reportes, searchTerm]);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Cargar datos del profesional
            const profesionalResponse = await apiClient.get(`${API_ENDPOINTS.PROFESIONALES}${id}/`);
            setProfesional(profesionalResponse.data);

            // Cargar reportes médicos del profesional
            const reportesResponse = await apiClient.get(`${API_ENDPOINTS.REPORTES_MEDICOS}?profesional=${id}`);
            setReportes(reportesResponse.data);
            
            setError(null);
        } catch (err) {
            setError('Error al cargar los reportes médicos');
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
                            Reportes Médicos del Profesional
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
                        Registros de Reportes Médicos
                    </Typography>

                    <Box sx={{ mb: 2 }}>
                        <TextField
                            fullWidth
                            variant="outlined"
                            placeholder="Buscar en reportes..."
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
                                    <TableCell><strong>Paciente</strong></TableCell>
                                    <TableCell><strong>Diagnóstico</strong></TableCell>
                                    <TableCell><strong>Tratamiento</strong></TableCell>
                                    <TableCell><strong>Observaciones</strong></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredReportes.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} align="center">
                                            {searchTerm ? 'No se encontraron resultados' : 'No hay reportes médicos registrados'}
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredReportes.map((reporte) => (
                                        <TableRow key={reporte.id_reporte}>
                                            <TableCell>{reporte.id_reporte || '-'}</TableCell>
                                            <TableCell>{reporte.fecha || '-'}</TableCell>
                                            <TableCell>
                                                {reporte.paciente 
                                                    ? `${reporte.paciente.nombre} ${reporte.paciente.apellido}`
                                                    : '-'
                                                }
                                            </TableCell>
                                            <TableCell>{reporte.diagnostico || '-'}</TableCell>
                                            <TableCell>{reporte.tratamiento || '-'}</TableCell>
                                            <TableCell>{reporte.observaciones || '-'}</TableCell>
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
