import React, { useState, useMemo } from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';
import Box from '@mui/material/Box';

/**
 * Componente reutilizable para renderizar tablas dinámicamente
 */
export default function DynamicTable({ columns, data, idField, onEdit, onDelete, emptyMessage, customActions = [] }) {
  const [searchTerm, setSearchTerm] = useState('');

  const getCellValue = (row, column) => {
    if (column.nested) {
      const nestedObj = row[column.field];
      if (!nestedObj) return column.default || '-';
      return column.nested.map(field => nestedObj[field]).filter(Boolean).join(' ');
    }
    return row[column.field] || column.default || '-';
  };

  // Filtrar datos según el término de búsqueda
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return data;

    return data.filter(row => {
      return columns.some(column => {
        const value = getCellValue(row, column);
        return value.toString().toLowerCase().includes(searchTerm.toLowerCase());
      });
    });
  }, [data, searchTerm, columns]);

  return (
    <Box>
      {/* Barra de búsqueda */}
      <Box sx={{ mb: 2 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Buscar..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      <TableContainer component={Paper} variant="outlined">
      <Table>
        <TableHead>
          <TableRow>
            {columns.map((column) => (
              <TableCell key={column.field} align={column.align || 'left'}>
                <strong>{column.label}</strong>
              </TableCell>
            ))}
            <TableCell align="center"><strong>Acciones</strong></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredData.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length + 1} align="center">
                {searchTerm ? 'No se encontraron resultados' : emptyMessage}
              </TableCell>
            </TableRow>
          ) : (
            filteredData.map((row) => (
              <TableRow key={row[idField]}>
                {columns.map((column) => (
                  <TableCell key={column.field} align={column.align || 'left'}>
                    {getCellValue(row, column)}
                  </TableCell>
                ))}
                <TableCell align="center">
                  <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
                    {customActions.map((action, index) => {
                      // Si hay una condición, evaluarla; si no, mostrar siempre
                      const shouldShow = action.condition ? action.condition(row) : true;
                      
                      if (!shouldShow) return null;
                      
                      return (
                        <IconButton
                          key={index}
                          size="small"
                          onClick={() => action.onClick(row[idField])}
                          disableRipple
                          sx={{ '&:hover': { bgcolor: 'transparent' } }}
                          title={action.title}
                        >
                          {action.icon}
                        </IconButton>
                      );
                    })}
                    {onEdit && (
                      <IconButton
                        size="small"
                        onClick={() => onEdit(row[idField])}
                        disableRipple
                        sx={{ '&:hover': { bgcolor: 'transparent' } }}
                        title="Editar"
                      >
                        <EditIcon fontSize="small" color="primary" />
                      </IconButton>
                    )}
                    {onDelete && (
                      <IconButton
                        size="small"
                        onClick={() => onDelete(row[idField])}
                        disableRipple
                        sx={{ '&:hover': { bgcolor: 'transparent' } }}
                        title="Eliminar"
                      >
                        <DeleteIcon fontSize="small" color="error" />
                      </IconButton>
                    )}
                  </Box>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
    </Box>
  );
}
