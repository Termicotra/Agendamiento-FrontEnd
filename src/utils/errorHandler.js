/**
 * Formatea errores de la API para mostrar al usuario
 * @param {Error} error - Error de Axios
 * @returns {string} Mensaje de error formateado
 */
export function formatApiErrors(error) {
  // Si el error tiene respuesta del servidor
  if (error.response) {
    const { data, status } = error.response;

    // Errores de validación con campo específico
    if (data?.errors) {
      return Object.entries(data.errors)
        .map(([field, messages]) => {
          const msgs = Array.isArray(messages) ? messages.join(', ') : messages;
          // Normalizar el nombre del campo para comparación (sin importar mayúsculas/minúsculas)
          const normalizedField = field.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
          
          // Si el error es de campos de autenticación/identificación, mostrar solo el mensaje
          const authFields = ['ci', 'cedula', 'username', 'password'];
          if (authFields.includes(normalizedField)) {
            return msgs;
          }
          
          // Para otros campos, incluir el nombre del campo
          const fieldLabel = formatFieldName(field);
          return `${fieldLabel}: ${msgs}`;
        })
        .join('\n');
    }

    // Error con detalle
    if (data?.detail) {
      return data.detail;
    }

    // Si hay mensaje directo
    if (data?.message) {
      return data.message;
    }

    // Errores genéricos por código HTTP
    const defaultMessages = {
      400: 'Datos inválidos. Por favor, verifica la información.',
      401: 'Credenciales inválidas. Verifica tu usuario y contraseña.',
      403: 'No tienes permisos para realizar esta acción.',
      404: 'Recurso no encontrado.',
      500: 'Error del servidor. Por favor, intenta más tarde.',
      503: 'Servicio no disponible. Por favor, intenta más tarde.'
    };

    return defaultMessages[status] || 'Error en la solicitud. Por favor, intenta nuevamente.';
  }

  // Si no hay respuesta del servidor (error de red/conexión)
  if (error.request) {
    // La petición se hizo pero no hubo respuesta
    return 'No se pudo conectar con el servidor.';
  }

  // Error en la configuración de la petición
  return error.message || 'Error desconocido. Por favor, intenta nuevamente.';
}

/**
 * Formatea el nombre de un campo para mostrarlo al usuario
 * @param {string} field - Nombre del campo
 * @returns {string} Nombre formateado
 */
export function formatFieldName(field) {
  const fieldNames = {
    'username': 'Usuario',
    'password': 'Contraseña',
    'ci': 'Cédula de identidad',
    'nombre': 'Nombre',
    'apellido': 'Apellido',
    'email': 'Email',
    'telefono': 'Teléfono',
    'direccion': 'Dirección',
    'fecha_nacimiento': 'Fecha de nacimiento',
    'old_password': 'Contraseña actual',
    'new_password': 'Nueva contraseña',
    'confirm_password': 'Confirmar contraseña',
    'especialidad': 'Especialidad',
    'registro_profesional': 'Registro profesional',
    'cargo': 'Cargo',
    'group': 'Grupo/Rol',
  };

  return fieldNames[field] || field.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

/**
 * Verifica si un error es de autenticación (401)
 * @param {Error} error - Error de Axios
 * @returns {boolean}
 */
export function isAuthError(error) {
  return error.response?.status === 401;
}

/**
 * Verifica si un error es de permisos (403)
 * @param {Error} error - Error de Axios
 * @returns {boolean}
 */
export function isPermissionError(error) {
  return error.response?.status === 403;
}

/**
 * Verifica si un error es de validación (400)
 * @param {Error} error - Error de Axios
 * @returns {boolean}
 */
export function isValidationError(error) {
  return error.response?.status === 400;
}

/**
 * Obtiene los errores de validación de un campo específico
 * @param {Error} error - Error de Axios
 * @param {string} field - Nombre del campo
 * @returns {string[]|null} Array de mensajes de error o null
 */
export function getFieldErrors(error, field) {
  const errors = error.response?.data?.errors;
  if (!errors || !errors[field]) {
    return null;
  }
  return Array.isArray(errors[field]) ? errors[field] : [errors[field]];
}
