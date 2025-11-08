import React from 'react';
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Dashboard from './components/dashboard/Dashboard';
import ListarTurnos from './components/turno/ListarTurnos';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

const theme = createTheme({
  palette: {
    mode: 'light',
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/pacientes" element={<div>Pacientes</div>} />
          <Route path="/turnos" element={<ListarTurnos />} />
          <Route path="/profesionales" element={<div>Profesionales</div>} />
          <Route path="/empleados" element={<div>Empleados</div>} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
