import React from 'react';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Grid from '@mui/material/Grid';

/**
 * Componente reutilizable para renderizar campos de formulario dinámicamente
 */
export default function DynamicField({ field, value, onChange, disabled, options = null }) {
  const { name, label, type, required, grid, rows } = field;

  const renderField = () => {
    switch (type) {
      case 'select':
        // Si no hay opciones cargadas todavía, no renderizar el select
        if (!options || options.length === 0) {
          return (
            <TextField
              fullWidth
              label={label}
              name={name}
              value=""
              disabled={true}
              helperText="Cargando opciones..."
            />
          );
        }
        
        return (
          <TextField
            fullWidth
            select
            label={label}
            name={name}
            value={value || ''}
            onChange={onChange}
            required={required}
            disabled={disabled}
          >
            {options.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        );

      case 'date':
      case 'time':
        return (
          <TextField
            fullWidth
            label={label}
            name={name}
            type={type}
            value={value || ''}
            onChange={onChange}
            required={required}
            disabled={disabled}
            InputLabelProps={{ shrink: true }}
          />
        );

      case 'textarea':
        return (
          <TextField
            fullWidth
            label={label}
            name={name}
            value={value || ''}
            onChange={onChange}
            required={required}
            disabled={disabled}
            multiline
            rows={rows || 3}
          />
        );

      case 'checkbox':
        return (
          <TextField
            fullWidth
            label={label}
            name={name}
            type="checkbox"
            checked={value || false}
            onChange={onChange}
            disabled={disabled}
          />
        );

      default:
        return (
          <TextField
            fullWidth
            label={label}
            name={name}
            type={type || 'text'}
            value={value || ''}
            onChange={onChange}
            required={required}
            disabled={disabled}
          />
        );
    }
  };

  return (
    <Grid item {...grid}>
      {renderField()}
    </Grid>
  );
}
