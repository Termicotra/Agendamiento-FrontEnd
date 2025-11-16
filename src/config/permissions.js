/**
 * Constantes de módulos del sistema
 * Estos deben coincidir exactamente con los nombres de módulos del backend
 */
export const MODULES = {
  TURNOS: 'turno',
  PACIENTES: 'paciente',
  PROFESIONALES: 'profesional',
  EMPLEADOS: 'empleado',
  REPORTES_MEDICOS: 'reportemedico',
  HISTORIALES_CLINICOS: 'historialclinico',
  DISPONIBILIDADES: 'disponibilidad',
  RECORDATORIOS: 'recordatorioturno',
  DASHBOARD: 'dashboard',
  USUARIOS: 'user',
  GRUPOS: 'group',
  PERMISOS: 'permission',
  CONFIGURACION: 'configuracion',
};

/**
 * Constantes de acciones/permisos
 * Estos deben coincidir con las acciones definidas en el backend
 */
export const ACTIONS = {
  VIEW: 'view',           // Ver/Listar
  CREATE: 'create',       // Crear
  EDIT: 'edit',           // Editar
  DELETE: 'delete',       // Eliminar
  EXPORT: 'export',       // Exportar
  MANAGE: 'manage',       // Gestión completa
};

/**
 * Roles del sistema (para referencia)
 */
export const ROLES = {
  ADMIN: 'administradores',
  ADMINISTRADORES: 'administradores',
  DOCTOR: 'doctor',
  RECEPCIONISTA: 'recepcionista',
  PACIENTE: 'paciente',
};

/**
 * Formato de permiso: "module.action"
 * Ejemplos:
 * - "turnos.view"
 * - "pacientes.create"
 * - "profesionales.edit"
 */
export const buildPermission = (module, action) => `${module}.${action}`;

/**
 * Permisos por defecto (fallback si el backend no responde)
 * NO USAR EN PRODUCCIÓN - solo para desarrollo
 */
export const DEFAULT_PERMISSIONS_BY_ROLE = {
  [ROLES.ADMIN]: [
    buildPermission(MODULES.TURNOS, ACTIONS.MANAGE),
    buildPermission(MODULES.PACIENTES, ACTIONS.MANAGE),
    buildPermission(MODULES.PROFESIONALES, ACTIONS.MANAGE),
    buildPermission(MODULES.EMPLEADOS, ACTIONS.MANAGE),
    buildPermission(MODULES.REPORTES_MEDICOS, ACTIONS.MANAGE),
    buildPermission(MODULES.HISTORIALES_CLINICOS, ACTIONS.MANAGE),
    buildPermission(MODULES.DISPONIBILIDADES, ACTIONS.MANAGE),
    buildPermission(MODULES.DASHBOARD, ACTIONS.VIEW),
    buildPermission(MODULES.USUARIOS, ACTIONS.MANAGE),
    buildPermission(MODULES.CONFIGURACION, ACTIONS.MANAGE),
  ],
  [ROLES.DOCTOR]: [
    buildPermission(MODULES.TURNOS, ACTIONS.VIEW),
    buildPermission(MODULES.TURNOS, ACTIONS.EDIT),
    buildPermission(MODULES.PACIENTES, ACTIONS.VIEW),
    buildPermission(MODULES.REPORTES_MEDICOS, ACTIONS.CREATE),
    buildPermission(MODULES.REPORTES_MEDICOS, ACTIONS.VIEW),
    buildPermission(MODULES.HISTORIALES_CLINICOS, ACTIONS.VIEW),
    buildPermission(MODULES.HISTORIALES_CLINICOS, ACTIONS.EDIT),
    buildPermission(MODULES.DISPONIBILIDADES, ACTIONS.VIEW),
    buildPermission(MODULES.DISPONIBILIDADES, ACTIONS.EDIT),
    buildPermission(MODULES.DASHBOARD, ACTIONS.VIEW),
  ],
  [ROLES.RECEPCIONISTA]: [
    buildPermission(MODULES.TURNOS, ACTIONS.VIEW),
    buildPermission(MODULES.TURNOS, ACTIONS.CREATE),
    buildPermission(MODULES.PACIENTES, ACTIONS.VIEW),
    buildPermission(MODULES.PACIENTES, ACTIONS.CREATE),
    buildPermission(MODULES.DASHBOARD, ACTIONS.VIEW),
  ],
  [ROLES.PACIENTE]: [
    buildPermission(MODULES.TURNOS, ACTIONS.VIEW),
    buildPermission(MODULES.TURNOS, ACTIONS.CREATE),
    buildPermission(MODULES.HISTORIALES_CLINICOS, ACTIONS.VIEW),
    buildPermission(MODULES.DASHBOARD, ACTIONS.VIEW),
  ],
};
