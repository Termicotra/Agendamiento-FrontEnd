/**
 * @enum {string} API_ENDPOINTS
 * Lista centralizada de las rutas de la API (sin la URL base).
 */
export const API_ENDPOINTS = {
    TURNOS: '/turnos/',
    PACIENTES: '/pacientes/',
    PROFESIONALES: '/profesionales/',
    REPORTES_MEDICOS: '/reportesMedicos/',
    HISTORIALES_CLINICOS: '/historialesClinicos/',
    EMPLEADOS: '/empleados/',
    DISPONIBILIDADES: '/disponibilidades/'
};

/**
 * @enum {string} AUTH_ENDPOINTS
 * Endpoints de autenticación (fuera del prefijo /api)
 */
export const AUTH_ENDPOINTS = {
    LOGIN: '/auth/api/login/',
    LOGOUT: '/auth/api/logout/',
    REFRESH_TOKEN: '/auth/api/token/refresh/',
    REGISTER: '/auth/api/register/',
    PROFILE: '/auth/api/perfil/',
    CHANGE_PASSWORD: '/auth/api/change-password/',
    PERMISSIONS: '/auth/api/permissions/',
    SOLICITUDES: '/auth/api/solicitudes/',
    SOLICITUD_APROBAR: (id) => `/auth/api/solicitudes/${id}/aprobar/`,
    SOLICITUD_RECHAZAR: (id) => `/auth/api/solicitudes/${id}/rechazar/`
};
