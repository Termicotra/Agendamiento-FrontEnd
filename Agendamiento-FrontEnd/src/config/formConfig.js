/**
 * Configuración de campos para formularios
 * Define la estructura de cada entidad del sistema
 */

export const TURNO_FIELDS = [
  {
    name: 'paciente_id',
    label: 'Paciente',
    type: 'select',
    required: true,
    grid: { xs: 12, sm: 6 },
    endpoint: 'PACIENTES',
    idField: 'id_paciente',
    displayFields: ['nombre', 'apellido']
  },
  {
    name: 'profesional_id',
    label: 'Profesional',
    type: 'select',
    required: true,
    grid: { xs: 12, sm: 6 },
    endpoint: 'PROFESIONALES',
    idField: 'id_profesional',
    displayFields: ['nombre', 'apellido', 'especialidad']
  },
  {
    name: 'empleado_id',
    label: 'Empleado',
    type: 'select',
    required: true,
    grid: { xs: 12, sm: 6 },
    endpoint: 'EMPLEADOS',
    idField: 'id_empleado',
    displayFields: ['nombre', 'apellido']
  },
  {
    name: 'fecha',
    label: 'Fecha',
    type: 'date',
    required: true,
    grid: { xs: 12, sm: 6 }
  },
  {
    name: 'hora',
    label: 'Hora',
    type: 'time',
    required: true,
    grid: { xs: 12, sm: 6 }
  },
  {
    name: 'estado',
    label: 'Estado',
    type: 'select',
    required: true,
    grid: { xs: 12, sm: 6 },
    options: [
      { value: 'Pendiente', label: 'Pendiente' },
      { value: 'Confirmado', label: 'Confirmado' },
      { value: 'Cancelado', label: 'Cancelado' },
      { value: 'Completado', label: 'Completado' },
      { value: 'Activo', label: 'Activo' }
    ]
  },
  {
    name: 'modalidad',
    label: 'Modalidad',
    type: 'select',
    required: false,
    grid: { xs: 12, sm: 6 },
    options: [
      { value: 'Presencial', label: 'Presencial' },
      { value: 'Virtual', label: 'Virtual' }
    ]
  },
  {
    name: 'motivo',
    label: 'Motivo',
    type: 'textarea',
    required: true,
    grid: { xs: 12 },
    rows: 3
  }
];

export const TURNO_TABLE_COLUMNS = [
  { field: 'id_turno', label: 'ID', align: 'left' },
  { field: 'paciente', label: 'Paciente', align: 'left', nested: ['nombre', 'apellido'] },
  { field: 'profesional', label: 'Profesional', align: 'left', nested: ['nombre', 'apellido'] },
  { field: 'fecha', label: 'Fecha', align: 'left' },
  { field: 'hora', label: 'Hora', align: 'left' },
  { field: 'motivo', label: 'Motivo', align: 'left' },
  { field: 'estado', label: 'Estado', align: 'left' },
  { field: 'modalidad', label: 'Modalidad', align: 'left', default: 'N/A' }
];

export const TURNO_CONFIG = {
  entityName: 'Turno',
  entityNamePlural: 'Turnos',
  endpoint: 'TURNOS',
  idField: 'id_turno',
  title: 'Gestión de Turnos',
  createButtonText: 'Nuevo Turno',
  createTitle: 'Crear Nuevo Turno',
  editTitle: 'Editar Turno',
  deleteConfirmMessage: '¿Estás seguro de eliminar este turno?',
  emptyMessage: 'No hay turnos registrados',
  defaultValues: {
    estado: 'Pendiente',
    modalidad: 'Presencial',
    fue_notificado: false
  }
};

// ===========================
// CONFIGURACIÓN DE PACIENTES
// ===========================

export const PACIENTE_FIELDS = [
  {
    name: 'ci',
    label: 'Cédula de Identidad',
    type: 'text',
    required: true,
    grid: { xs: 12, sm: 6 }
  },
  {
    name: 'nombre',
    label: 'Nombre',
    type: 'text',
    required: true,
    grid: { xs: 12, sm: 6 }
  },
  {
    name: 'apellido',
    label: 'Apellido',
    type: 'text',
    required: true,
    grid: { xs: 12, sm: 6 }
  },
  {
    name: 'fecha_nacimiento',
    label: 'Fecha de Nacimiento',
    type: 'date',
    required: true,
    grid: { xs: 12, sm: 6 }
  },
  {
    name: 'telefono',
    label: 'Teléfono',
    type: 'tel',
    required: true,
    grid: { xs: 12, sm: 6 }
  },
  {
    name: 'direccion',
    label: 'Dirección',
    type: 'text',
    required: false,
    grid: { xs: 12, sm: 6 }
  },
  {
    name: 'otro_contacto',
    label: 'Otro Contacto',
    type: 'text',
    required: false,
    grid: { xs: 12 }
  }
];

export const PACIENTE_TABLE_COLUMNS = [
  { field: 'id_paciente', label: 'ID', align: 'left' },
  { field: 'ci', label: 'CI', align: 'left' },
  { field: 'nombre', label: 'Nombre', align: 'left' },
  { field: 'apellido', label: 'Apellido', align: 'left' },
  { field: 'fecha_nacimiento', label: 'Fecha Nac.', align: 'left' },
  { field: 'telefono', label: 'Teléfono', align: 'left' },
  { field: 'direccion', label: 'Dirección', align: 'left', default: 'N/A' }
];

export const PACIENTE_CONFIG = {
  entityName: 'Paciente',
  entityNamePlural: 'Pacientes',
  endpoint: 'PACIENTES',
  idField: 'id_paciente',
  title: 'Gestión de Pacientes',
  createButtonText: 'Nuevo Paciente',
  createTitle: 'Crear Nuevo Paciente',
  editTitle: 'Editar Paciente',
  deleteConfirmMessage: '¿Estás seguro de eliminar este paciente?',
  emptyMessage: 'No hay pacientes registrados',
  defaultValues: {}
};

// ===========================
// CONFIGURACIÓN DE EMPLEADOS
// ===========================

export const EMPLEADO_FIELDS = [
  {
    name: 'ci',
    label: 'Cédula de Identidad',
    type: 'text',
    required: true,
    grid: { xs: 12, sm: 6 }
  },
  {
    name: 'nombre',
    label: 'Nombre',
    type: 'text',
    required: true,
    grid: { xs: 12, sm: 6 }
  },
  {
    name: 'apellido',
    label: 'Apellido',
    type: 'text',
    required: true,
    grid: { xs: 12, sm: 6 }
  },
  {
    name: 'fecha_nacimiento',
    label: 'Fecha de Nacimiento',
    type: 'date',
    required: true,
    grid: { xs: 12, sm: 6 }
  },
  {
    name: 'cargo',
    label: 'Cargo',
    type: 'text',
    required: true,
    grid: { xs: 12, sm: 6 }
  },
  {
    name: 'telefono',
    label: 'Teléfono',
    type: 'tel',
    required: false,
    grid: { xs: 12, sm: 6 }
  },
  {
    name: 'direccion',
    label: 'Dirección',
    type: 'text',
    required: false,
    grid: { xs: 12 }
  }
];

export const EMPLEADO_TABLE_COLUMNS = [
  { field: 'id_empleado', label: 'ID', align: 'left' },
  { field: 'ci', label: 'CI', align: 'left' },
  { field: 'nombre', label: 'Nombre', align: 'left' },
  { field: 'apellido', label: 'Apellido', align: 'left' },
  { field: 'cargo', label: 'Cargo', align: 'left' },
  { field: 'telefono', label: 'Teléfono', align: 'left', default: 'N/A' },
  { field: 'fecha_nacimiento', label: 'Fecha Nac.', align: 'left' }
];

export const EMPLEADO_CONFIG = {
  entityName: 'Empleado',
  entityNamePlural: 'Empleados',
  endpoint: 'EMPLEADOS',
  idField: 'id_empleado',
  title: 'Gestión de Empleados',
  createButtonText: 'Nuevo Empleado',
  createTitle: 'Crear Nuevo Empleado',
  editTitle: 'Editar Empleado',
  deleteConfirmMessage: '¿Estás seguro de eliminar este empleado?',
  emptyMessage: 'No hay empleados registrados',
  defaultValues: {}
};

// ==============================
// CONFIGURACIÓN DE PROFESIONALES
// ==============================

export const PROFESIONAL_FIELDS = [
  {
    name: 'ci',
    label: 'Cédula de Identidad',
    type: 'text',
    required: true,
    grid: { xs: 12, sm: 6 }
  },
  {
    name: 'nombre',
    label: 'Nombre',
    type: 'text',
    required: true,
    grid: { xs: 12, sm: 6 }
  },
  {
    name: 'apellido',
    label: 'Apellido',
    type: 'text',
    required: true,
    grid: { xs: 12, sm: 6 }
  },
  {
    name: 'fecha_nacimiento',
    label: 'Fecha de Nacimiento',
    type: 'date',
    required: true,
    grid: { xs: 12, sm: 6 }
  },
  {
    name: 'especialidad',
    label: 'Especialidad',
    type: 'text',
    required: true,
    grid: { xs: 12, sm: 6 }
  },
  {
    name: 'registro_profesional',
    label: 'Registro Profesional',
    type: 'text',
    required: true,
    grid: { xs: 12, sm: 6 }
  },
  {
    name: 'telefono',
    label: 'Teléfono',
    type: 'tel',
    required: true,
    grid: { xs: 12, sm: 6 }
  },
  {
    name: 'direccion',
    label: 'Dirección',
    type: 'text',
    required: false,
    grid: { xs: 12, sm: 6 }
  },
  {
    name: 'otro_contacto',
    label: 'Otro Contacto',
    type: 'text',
    required: false,
    grid: { xs: 12 }
  }
];

export const PROFESIONAL_TABLE_COLUMNS = [
  { field: 'id_profesional', label: 'ID', align: 'left' },
  { field: 'ci', label: 'CI', align: 'left' },
  { field: 'nombre', label: 'Nombre', align: 'left' },
  { field: 'apellido', label: 'Apellido', align: 'left' },
  { field: 'especialidad', label: 'Especialidad', align: 'left' },
  { field: 'registro_profesional', label: 'Registro Prof.', align: 'left' },
  { field: 'telefono', label: 'Teléfono', align: 'left' }
];

export const PROFESIONAL_CONFIG = {
  entityName: 'Profesional',
  entityNamePlural: 'Profesionales',
  endpoint: 'PROFESIONALES',
  idField: 'id_profesional',
  title: 'Gestión de Profesionales',
  createButtonText: 'Nuevo Profesional',
  createTitle: 'Crear Nuevo Profesional',
  editTitle: 'Editar Profesional',
  deleteConfirmMessage: '¿Estás seguro de eliminar este profesional?',
  emptyMessage: 'No hay profesionales registrados',
  defaultValues: {}
};

