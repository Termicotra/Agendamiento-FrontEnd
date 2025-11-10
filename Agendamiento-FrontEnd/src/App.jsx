import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import Dashboard from './components/dashboard/Dashboard';
import ListarTurnos from './components/turno/ListarTurnos';
import FormularioTurno from './components/turno/FormularioTurno';
import ListarPacientes from './components/paciente/ListarPacientes';
import FormularioPaciente from './components/paciente/FormularioPaciente';
import HistorialMedicoPaciente from './components/paciente/HistorialMedicoPaciente';
import ListarEmpleados from './components/empleado/ListarEmpleados';
import FormularioEmpleado from './components/empleado/FormularioEmpleado';
import ListarProfesionales from './components/profesional/ListarProfesionales';
import FormularioProfesional from './components/profesional/FormularioProfesional';
import HistorialesProfesional from './components/profesional/HistorialesProfesional';
import ReportesProfesional from './components/profesional/ReportesProfesional';
import DisponibilidadProfesional from './components/profesional/DisponibilidadProfesional';
import Login from './components/auth/Login';
import Navbar from './components/Navbar';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import { AuthProvider, useAuth } from './context/AuthContext';

const theme = createTheme({
  palette: {
    mode: 'light',
  },
});

function AppRoutes() {
  const { authenticated, loading } = useAuth();

  if (loading) {
    return <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Cargando...</Box>;
  }

  return (
    <>
      {authenticated && <Navbar />}
      <Box sx={{ pt: authenticated ? 12 : 0, bgcolor: 'background.default', minHeight: '100vh' }}>
        <Routes>
          <Route path="/login" element={!authenticated ? <Login /> : <Navigate to="/" />} />
          <Route path="/" element={authenticated ? <Dashboard /> : <Navigate to="/login" />} />
          <Route path="/pacientes" element={authenticated ? <ListarPacientes /> : <Navigate to="/login" />} />
          <Route path="/pacientes/crear" element={authenticated ? <FormularioPaciente /> : <Navigate to="/login" />} />
          <Route path="/pacientes/editar/:id" element={authenticated ? <FormularioPaciente /> : <Navigate to="/login" />} />
          <Route path="/pacientes/:id/historial" element={authenticated ? <HistorialMedicoPaciente /> : <Navigate to="/login" />} />
          <Route path="/turnos" element={authenticated ? <ListarTurnos /> : <Navigate to="/login" />} />
          <Route path="/turnos/crear" element={authenticated ? <FormularioTurno /> : <Navigate to="/login" />} />
          <Route path="/turnos/editar/:id" element={authenticated ? <FormularioTurno /> : <Navigate to="/login" />} />
          <Route path="/empleados" element={authenticated ? <ListarEmpleados /> : <Navigate to="/login" />} />
          <Route path="/empleados/crear" element={authenticated ? <FormularioEmpleado /> : <Navigate to="/login" />} />
          <Route path="/empleados/editar/:id" element={authenticated ? <FormularioEmpleado /> : <Navigate to="/login" />} />
          <Route path="/profesionales" element={authenticated ? <ListarProfesionales /> : <Navigate to="/login" />} />
          <Route path="/profesionales/crear" element={authenticated ? <FormularioProfesional /> : <Navigate to="/login" />} />
          <Route path="/profesionales/editar/:id" element={authenticated ? <FormularioProfesional /> : <Navigate to="/login" />} />
          <Route path="/profesionales/:id/historiales" element={authenticated ? <HistorialesProfesional /> : <Navigate to="/login" />} />
          <Route path="/profesionales/:id/reportes" element={authenticated ? <ReportesProfesional /> : <Navigate to="/login" />} />
          <Route path="/profesionales/:id/disponibilidad" element={authenticated ? <DisponibilidadProfesional /> : <Navigate to="/login" />} />
        </Routes>
      </Box>
    </>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <AppRoutes />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;