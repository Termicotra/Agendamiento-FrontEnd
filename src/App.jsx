import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import Dashboard from './components/dashboard/Dashboard';
import ListarTurnos from './components/turno/ListarTurnos';
import FormularioTurno from './components/turno/FormularioTurno';
import ListarPacientes from './components/paciente/ListarPacientes';
import FormularioPaciente from './components/paciente/FormularioPaciente';
import HistorialMedicoPaciente from './components/paciente/HistorialMedicoPaciente';
import HistorialesPaciente from './components/paciente/HistorialesPaciente';
import ReportesPaciente from './components/paciente/ReportesPaciente';
import MiHistorialMedico from './components/paciente/MiHistorialMedico';
import ListarEmpleados from './components/empleado/ListarEmpleados';
import FormularioEmpleado from './components/empleado/FormularioEmpleado';
import ListarProfesionales from './components/profesional/ListarProfesionales';
import FormularioProfesional from './components/profesional/FormularioProfesional';
import HistorialesProfesional from './components/profesional/HistorialesProfesional';
import ReportesProfesional from './components/profesional/ReportesProfesional';
import DisponibilidadProfesional from './components/profesional/DisponibilidadProfesional';
import FormularioHistorial from './components/historial/FormularioHistorial';
import FormularioReporte from './components/reporte/FormularioReporte';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Profile from './components/auth/Profile';
import ChangePassword from './components/auth/ChangePassword';
import SolicitudesManager from './components/admin/SolicitudesManager';
import SolicitudesTurno from './components/admin/SolicitudesTurno';
import Navbar from './components/Navbar';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PermissionsProvider } from './context/PermissionsContext';
import { PermissionProtectedRoute, UnauthorizedPage } from './components/common/PermissionProtection';
import { RoleProtectedRoute } from './components/common/RoleProtection';
import { MODULES, ACTIONS, buildPermission } from './config/permissions';

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
      <Box sx={{ pt: authenticated ? 12 : 0, bgcolor: 'background.default', minWidth: '98vw', minHeight: '100vh', display: 'flex', justifyContent: 'center', }}>
        <Routes>
          {/* Rutas públicas */}
          <Route path="/login" element={authenticated ? <Navigate to="/" /> : <Login />} />
          <Route path="/register" element={authenticated ? <Navigate to="/" /> : <Register />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
          
          {/* Rutas de perfil (requieren autenticación) */}
          <Route 
            path="/profile" 
            element={authenticated ? <Profile /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/change-password" 
            element={authenticated ? <ChangePassword /> : <Navigate to="/login" />} 
          />
          
          {/* Ruta de historial médico personal (solo pacientes) */}
          <Route 
            path="/mi-historial" 
            element={
              authenticated ? (
                <RoleProtectedRoute allowedRoles={['pacientes']}>
                  <MiHistorialMedico />
                </RoleProtectedRoute>
              ) : <Navigate to="/login" />
            } 
          />
          
          {/* Dashboard */}
          <Route path="/" element={authenticated ? <Dashboard /> : <Navigate to="/login" />} />
          
          {/* Rutas de administración (solo administradores) */}
          <Route 
            path="/admin/solicitudes" 
            element={
              authenticated ? (
                <RoleProtectedRoute allowedRoles={['administradores']}>
                  <SolicitudesManager />
                </RoleProtectedRoute>
              ) : <Navigate to="/login" />
            } 
          />
          <Route 
            path="/admin/solicitudes-turnos" 
            element={
              authenticated ? (
                <RoleProtectedRoute allowedRoles={['administradores']}>
                  <SolicitudesTurno />
                </RoleProtectedRoute>
              ) : <Navigate to="/login" />
            } 
          />
          
          {/* Rutas de Pacientes */}
          <Route 
            path="/pacientes" 
            element={
              authenticated ? (
                <PermissionProtectedRoute module={MODULES.PACIENTES}>
                  <ListarPacientes />
                </PermissionProtectedRoute>
              ) : <Navigate to="/login" />
            } 
          />
          <Route 
            path="/pacientes/crear" 
            element={
              authenticated ? (
                <PermissionProtectedRoute permission={buildPermission(MODULES.PACIENTES, ACTIONS.CREATE)}>
                  <FormularioPaciente />
                </PermissionProtectedRoute>
              ) : <Navigate to="/login" />
            } 
          />
          <Route 
            path="/pacientes/editar/:id" 
            element={
              authenticated ? (
                <PermissionProtectedRoute permission={buildPermission(MODULES.PACIENTES, ACTIONS.EDIT)}>
                  <FormularioPaciente />
                </PermissionProtectedRoute>
              ) : <Navigate to="/login" />
            } 
          />
          <Route 
            path="/pacientes/:id/historial" 
            element={
              authenticated ? (
                <PermissionProtectedRoute module={MODULES.HISTORIALES_CLINICOS}>
                  <HistorialMedicoPaciente />
                </PermissionProtectedRoute>
              ) : <Navigate to="/login" />
            } 
          />
          
          {/* Rutas de Turnos */}
          <Route 
            path="/turnos" 
            element={
              authenticated ? (
                <PermissionProtectedRoute module={MODULES.TURNOS}>
                  <ListarTurnos />
                </PermissionProtectedRoute>
              ) : <Navigate to="/login" />
            } 
          />
          <Route 
            path="/turnos/crear" 
            element={
              authenticated ? (
                <PermissionProtectedRoute permission={buildPermission(MODULES.TURNOS, ACTIONS.CREATE)}>
                  <FormularioTurno />
                </PermissionProtectedRoute>
              ) : <Navigate to="/login" />
            } 
          />
          <Route 
            path="/turnos/editar/:id" 
            element={
              authenticated ? (
                <PermissionProtectedRoute permission={buildPermission(MODULES.TURNOS, ACTIONS.EDIT)}>
                  <FormularioTurno />
                </PermissionProtectedRoute>
              ) : <Navigate to="/login" />
            } 
          />
          
          {/* Rutas de Empleados */}
          <Route 
            path="/empleados" 
            element={
              authenticated ? (
                <PermissionProtectedRoute module={MODULES.EMPLEADOS}>
                  <ListarEmpleados />
                </PermissionProtectedRoute>
              ) : <Navigate to="/login" />
            } 
          />
          <Route 
            path="/empleados/crear" 
            element={
              authenticated ? (
                <PermissionProtectedRoute permission={buildPermission(MODULES.EMPLEADOS, ACTIONS.CREATE)}>
                  <FormularioEmpleado />
                </PermissionProtectedRoute>
              ) : <Navigate to="/login" />
            } 
          />
          <Route 
            path="/empleados/editar/:id" 
            element={
              authenticated ? (
                <PermissionProtectedRoute permission={buildPermission(MODULES.EMPLEADOS, ACTIONS.EDIT)}>
                  <FormularioEmpleado />
                </PermissionProtectedRoute>
              ) : <Navigate to="/login" />
            } 
          />
          
          {/* Rutas de Profesionales */}
          <Route 
            path="/profesionales" 
            element={
              authenticated ? (
                <PermissionProtectedRoute module={MODULES.PROFESIONALES}>
                  <ListarProfesionales />
                </PermissionProtectedRoute>
              ) : <Navigate to="/login" />
            } 
          />
          <Route 
            path="/profesionales/crear" 
            element={
              authenticated ? (
                <PermissionProtectedRoute permission={buildPermission(MODULES.PROFESIONALES, ACTIONS.CREATE)}>
                  <FormularioProfesional />
                </PermissionProtectedRoute>
              ) : <Navigate to="/login" />
            } 
          />
          <Route 
            path="/profesionales/editar/:id" 
            element={
              authenticated ? (
                <PermissionProtectedRoute permission={buildPermission(MODULES.PROFESIONALES, ACTIONS.EDIT)}>
                  <FormularioProfesional />
                </PermissionProtectedRoute>
              ) : <Navigate to="/login" />
            } 
          />
          <Route 
            path="/profesionales/:id/historiales" 
            element={
              authenticated ? (
                <RoleProtectedRoute allowedRoles={['administradores', 'profesionales']}>
                  <PermissionProtectedRoute module={MODULES.HISTORIALES_CLINICOS}>
                    <HistorialesProfesional />
                  </PermissionProtectedRoute>
                </RoleProtectedRoute>
              ) : <Navigate to="/login" />
            } 
          />
          <Route 
            path="/profesionales/:id/reportes" 
            element={
              authenticated ? (
                <PermissionProtectedRoute module={MODULES.REPORTES_MEDICOS}>
                  <ReportesProfesional />
                </PermissionProtectedRoute>
              ) : <Navigate to="/login" />
            } 
          />
          <Route 
            path="/profesionales/:id/disponibilidad" 
            element={
              authenticated ? (
                <PermissionProtectedRoute module={MODULES.DISPONIBILIDADES}>
                  <DisponibilidadProfesional />
                </PermissionProtectedRoute>
              ) : <Navigate to="/login" />
            } 
          />
          <Route 
            path="/profesionales/:id/historiales/editar/:historialId" 
            element={
              authenticated ? (
                <PermissionProtectedRoute permission={buildPermission(MODULES.HISTORIALES_CLINICOS, ACTIONS.EDIT)}>
                  <FormularioHistorial />
                </PermissionProtectedRoute>
              ) : <Navigate to="/login" />
            } 
          />
          <Route 
            path="/profesionales/:id/reportes/editar/:reporteId" 
            element={
              authenticated ? (
                <PermissionProtectedRoute permission={buildPermission(MODULES.REPORTES_MEDICOS, ACTIONS.EDIT)}>
                  <FormularioReporte />
                </PermissionProtectedRoute>
              ) : <Navigate to="/login" />
            } 
          />
          
          {/* Rutas de Historiales Clínicos de Pacientes */}
          <Route 
            path="/pacientes/:id/historiales" 
            element={
              authenticated ? (
                <PermissionProtectedRoute module={MODULES.HISTORIALES_CLINICOS}>
                  <HistorialesPaciente />
                </PermissionProtectedRoute>
              ) : <Navigate to="/login" />
            } 
          />
          <Route 
            path="/pacientes/:id/historiales/crear" 
            element={
              authenticated ? (
                <PermissionProtectedRoute permission={buildPermission(MODULES.HISTORIALES_CLINICOS, ACTIONS.CREATE)}>
                  <FormularioHistorial />
                </PermissionProtectedRoute>
              ) : <Navigate to="/login" />
            } 
          />
          <Route 
            path="/pacientes/:id/historiales/editar/:historialId" 
            element={
              authenticated ? (
                <PermissionProtectedRoute permission={buildPermission(MODULES.HISTORIALES_CLINICOS, ACTIONS.EDIT)}>
                  <FormularioHistorial />
                </PermissionProtectedRoute>
              ) : <Navigate to="/login" />
            } 
          />
          
          {/* Rutas de Reportes Médicos de Pacientes */}
          <Route 
            path="/pacientes/:id/reportes" 
            element={
              authenticated ? (
                <PermissionProtectedRoute module={MODULES.REPORTES_MEDICOS}>
                  <ReportesPaciente />
                </PermissionProtectedRoute>
              ) : <Navigate to="/login" />
            } 
          />
          <Route 
            path="/pacientes/:id/reportes/crear" 
            element={
              authenticated ? (
                <PermissionProtectedRoute permission={buildPermission(MODULES.REPORTES_MEDICOS, ACTIONS.CREATE)}>
                  <FormularioReporte />
                </PermissionProtectedRoute>
              ) : <Navigate to="/login" />
            } 
          />
          <Route 
            path="/pacientes/:id/reportes/editar/:reporteId" 
            element={
              authenticated ? (
                <PermissionProtectedRoute permission={buildPermission(MODULES.REPORTES_MEDICOS, ACTIONS.EDIT)}>
                  <FormularioReporte />
                </PermissionProtectedRoute>
              ) : <Navigate to="/login" />
            } 
          />
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
        <PermissionsProvider>
          <Router>
            <AppRoutes />
          </Router>
        </PermissionsProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
