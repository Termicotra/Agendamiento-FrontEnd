# 🏥 Sistema de Agendamiento Médico - Frontend

Frontend desarrollado con React + Vite para el sistema de gestión médica.

## 📋 Características Principales

- ✅ **Autenticación JWT** con refresh automático
- ✅ **Sistema de roles** (Pacientes, Profesionales, Empleados, Administradores)
- ✅ **Sistema de permisos** granular por módulo y acción
- ✅ **Gestión de solicitudes de registro** con aprobación de administrador
- ✅ **Perfil de usuario** con cambio de contraseña
- ✅ **Rutas protegidas** por rol y permiso
- ✅ **Manejo centralizado de errores**
- ✅ **UI con Material-UI**

## 🚀 Inicio Rápido

### Prerrequisitos

- Node.js 16+
- npm o yarn
- Backend Django corriendo en `http://localhost:8000`

### Instalación

```bash
# Clonar el repositorio
git clone <url-del-repo>
cd Agendamiento-FrontEnd

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

## 🐳 Docker

### Opción 1: Docker Compose (Recomendado)

```bash
# Construir y levantar el contenedor
docker-compose up -d

# Ver logs
docker-compose logs -f

# Detener el contenedor
docker-compose down
```

La aplicación estará disponible en `http://localhost:3000`

### Opción 2: Docker manual

```bash
# Construir la imagen
docker build -t agendamiento-frontend .

# Ejecutar el contenedor
docker run -d -p 3000:80 --name agendamiento-frontend agendamiento-frontend

# Ver logs
docker logs -f agendamiento-frontend

# Detener y eliminar
docker stop agendamiento-frontend
docker rm agendamiento-frontend
```

### Configuración Docker

El proyecto incluye:
- **Dockerfile**: Build multi-stage con Node.js 18 y Nginx Alpine
- **docker-compose.yml**: Orquestación simplificada
- **nginx.conf**: Configuración optimizada para React Router
- **.dockerignore**: Exclusión de archivos innecesarios

### Variables de entorno en Docker

Para configurar la URL del backend en producción, modifica `docker-compose.yml`:

```yaml
environment:
  - NODE_ENV=production
  - VITE_API_URL=http://tu-backend:8000
```

**Nota**: Las variables `VITE_*` deben estar definidas en tiempo de build, por lo que deberás reconstruir la imagen si cambias la URL del backend.

## 📁 Estructura del Proyecto

```
src/
├── components/          # Componentes React
│   ├── auth/           # Login, Register, Profile, ChangePassword
│   ├── admin/          # SolicitudesManager
│   ├── common/         # RoleProtection, PermissionProtection
│   ├── dashboard/      # Dashboard principal
│   ├── paciente/       # Gestión de pacientes
│   ├── profesional/    # Gestión de profesionales
│   ├── empleado/       # Gestión de empleados
│   └── turno/          # Gestión de turnos
├── config/             # Configuración de API y endpoints
├── context/            # Contextos de React (Auth, Permissions)
├── hooks/              # Custom hooks (useRoles, useUser)
├── services/           # Servicios de API
│   ├── authService.js          # ⭐ Autenticación
│   ├── solicitudesService.js   # ⭐ Gestión de solicitudes
│   └── permissionsService.js   # Permisos
├── utils/              # Utilidades
│   ├── errorHandler.js         # ⭐ Manejo de errores
│   └── jwt.js                  # Decodificación JWT
└── App.jsx             # Configuración de rutas
```

## 🔑 Características de Autenticación

### Login
- Usuario case-insensitive
- Refresh automático de tokens cuando expiran
- Redirección según rol del usuario
- Ruta: `/login`

### Registro
- Solicitud de registro con aprobación de admin
- Validación de CI existente
- Contraseñas seguras (mín 8 caracteres)
- Ruta: `/register`

### Perfil
- Vista completa de información del usuario
- Datos diferenciados por tipo (Paciente/Profesional/Empleado)
- Cambio de contraseña
- Rutas: `/profile`, `/change-password`

## 👥 Roles y Permisos

### Roles Disponibles
- **Pacientes**: Gestión de turnos propios, ver su historial
- **Profesionales**: Gestión de turnos, historiales, reportes médicos
- **Empleados**: Gestión de pacientes, profesionales, turnos
- **Administradores**: Acceso completo + gestión de solicitudes

### Protección de Rutas

```jsx
// Por rol
<RoleProtectedRoute allowedRoles={['administradores']}>
  <AdminPanel />
</RoleProtectedRoute>

// Por permiso
<PermissionProtectedRoute permission="pacientes.create">
  <CrearPaciente />
</PermissionProtectedRoute>

// Por módulo
<PermissionProtectedRoute module="turnos">
  <ListarTurnos />
</PermissionProtectedRoute>
```

## 🛠️ Servicios Principales

### authService
```javascript
import { authService } from './services/authService';

// Login
const userData = await authService.login('usuario', 'password');

// Registro
await authService.register('usuario', 'password', '12345678');

// Obtener perfil
const profile = await authService.getProfile();

// Cambiar contraseña
await authService.changePassword('old', 'new', 'confirm');

// Logout
await authService.logout();
```

### solicitudesService (Admin)
```javascript
import { solicitudesService } from './services/solicitudesService';

// Listar solicitudes
const data = await solicitudesService.listarSolicitudes('pendiente');

// Aprobar solicitud
await solicitudesService.aprobarSolicitud(1, 'pacientes');

// Rechazar solicitud
await solicitudesService.rechazarSolicitud(1);
```

## 📚 Documentación

- **[FRONTEND_IMPLEMENTATION.md](./FRONTEND_IMPLEMENTATION.md)** - Resumen completo de la implementación
- **[INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md)** - Guía de integración y testing
- **[FRONTEND_API_DOCUMENTATION.md](../Sistema-Agendamiento-Medico-PP1/FRONTEND_API_DOCUMENTATION.md)** - Documentación de la API del backend
- **[PERMISSIONS_GUIDE.md](./PERMISSIONS_GUIDE.md)** - Guía de permisos
- **[ROLES_AUTH_GUIDE.md](./ROLES_AUTH_GUIDE.md)** - Guía de roles y autenticación

## 🧪 Testing

### Test Manual

1. **Registro**
   - Ir a `/register`
   - Completar formulario con CI válida
   - Verificar mensaje de éxito

2. **Aprobación (Admin)**
   - Login como admin
   - Ir a `/admin/solicitudes`
   - Aprobar solicitud seleccionando rol

3. **Login**
   - Usar credenciales del usuario aprobado
   - Verificar redirección según rol

4. **Perfil**
   - Ir a `/profile`
   - Verificar información mostrada
   - Cambiar contraseña en `/change-password`

## ⚙️ Configuración

### Variables de Entorno (opcional)

Crear `.env` en la raíz:

```env
VITE_API_URL=http://localhost:8000
```

### Configuración de API

Editar `src/config/apiClient.js`:

```javascript
const API_BASE_URL = 'http://localhost:8000';
```

## 🔧 Scripts Disponibles

```bash
# Desarrollo
npm run dev

# Build para producción
npm run build

# Preview del build
npm run preview

# Linting
npm run lint
```

## 🚢 Despliegue en Producción

### Con Docker (Recomendado)

```bash
# 1. Configurar variables de entorno si es necesario
# Editar docker-compose.yml o crear .env

# 2. Construir y desplegar
docker-compose up -d --build

# 3. Verificar que esté corriendo
docker-compose ps
```

### Sin Docker

```bash
# 1. Build de producción
npm run build

# 2. Servir con un servidor web (ej: serve)
npx serve -s dist -l 3000
```

## 🐛 Troubleshooting

### Error de conexión con el backend
- Verificar que Django esté corriendo
- Verificar CORS configurado en Django
- Verificar URL en `apiClient.js`
- Si usas Docker, verificar que ambos contenedores estén en la misma red

### Tokens expirados
- Limpiar localStorage: `localStorage.clear()`
- Volver a hacer login

### No tienes permisos
- Verificar que el usuario tenga el rol correcto
- Verificar que el backend retorne permisos correctos

### Problemas con Docker
- **Puerto ocupado**: Cambiar el puerto en `docker-compose.yml` (ej: `"8080:80"`)
- **Cambios no se reflejan**: Reconstruir imagen con `docker-compose up -d --build`
- **Error de red**: Verificar que la red Docker esté creada correctamente
- **Logs del contenedor**: `docker-compose logs -f frontend`

## 📦 Tecnologías Utilizadas

- **React** 18.3
- **Vite** 6.0
- **Material-UI** 6.1
- **React Router** 7.0
- **Axios** para peticiones HTTP

## 👨‍💻 Desarrollo

### Agregar nuevo componente

```bash
# Crear archivo
src/components/nuevo/MiComponente.jsx

# Agregar ruta en App.jsx
<Route path="/mi-ruta" element={<MiComponente />} />
```

### Agregar nuevo servicio

```javascript
// src/services/miServicio.js
import { apiClient } from '../config/apiClient';

class MiServicio {
  async getData() {
    const response = await apiClient.get('/mi-endpoint/');
    return response.data;
  }
}

export const miServicio = new MiServicio();
```

## 🤝 Contribución

1. Fork el proyecto
2. Crear branch (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push al branch (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

## 📄 Licencia

Este proyecto es parte de un trabajo de Práctica Profesional.

## 📞 Contacto

Para dudas o problemas:
1. Revisar documentación en `/docs`
2. Verificar logs del navegador y backend
3. Consultar guías de integración

---

**Última actualización**: 15 de Noviembre de 2025  
**Versión**: 1.0.0
