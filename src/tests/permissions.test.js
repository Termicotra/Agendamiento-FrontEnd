/**
 * Test manual para verificar el sistema de permisos
 * Ejecutar estos pasos en la consola del navegador después del login
 */

// 1. Verificar que el token JWT está guardado
console.log('=== TEST 1: Token JWT ===');
const token = localStorage.getItem('jwt');
console.log('Token existe:', !!token);
console.log('Token:', token?.substring(0, 50) + '...');

// 2. Verificar roles en localStorage
console.log('\n=== TEST 2: Roles en localStorage ===');
const rolesStr = localStorage.getItem('user_roles');
console.log('Roles (string):', rolesStr);
const roles = rolesStr ? JSON.parse(rolesStr) : [];
console.log('Roles (parsed):', roles);

// 3. Verificar permisos en localStorage
console.log('\n=== TEST 3: Permisos en localStorage ===');
const permissionsStr = localStorage.getItem('user_permissions');
console.log('Permisos existen:', !!permissionsStr);
if (permissionsStr) {
  const permissionsData = JSON.parse(permissionsStr);
  console.log('Permisos data:', {
    permissions: permissionsData.permissions?.length || 0,
    modules: permissionsData.modules?.length || 0,
    roles: permissionsData.roles?.length || 0,
    timestamp: permissionsData.timestamp
  });
  console.log('Lista de permisos:', permissionsData.permissions);
  console.log('Lista de módulos:', permissionsData.modules);
}

// 4. Decodificar el token manualmente
console.log('\n=== TEST 4: Decodificar JWT ===');
if (token) {
  try {
    const parts = token.split('.');
    if (parts.length === 3) {
      const payload = parts[1];
      // Decodificar base64url
      const decoded = atob(payload.replaceAll('-', '+').replaceAll('_', '/'));
      const data = JSON.parse(decoded);
      console.log('Payload del token:', data);
      console.log('Usuario:', data.username || data.user);
      console.log('Roles en token:', data.roles);
      console.log('User ID:', data.user_id);
    }
  } catch (e) {
    console.error('Error al decodificar:', e);
  }
}

// 5. Test de funciones de permisos (ejecutar en React DevTools)
console.log('\n=== TEST 5: Funciones de permisos ===');
console.log('Para probar las funciones de permisos:');
console.log('1. Abrir React DevTools');
console.log('2. Seleccionar el componente Dashboard');
console.log('3. En la consola, ejecutar:');
console.log('   $r.props (para ver las props del componente)');

// Función helper para verificar endpoint de permisos
async function testPermissionsEndpoint() {
  console.log('\n=== TEST 6: Endpoint de permisos ===');
  const token = localStorage.getItem('jwt');
  if (!token) {
    console.error('No hay token para hacer la prueba');
    return;
  }
  
  try {
    const response = await fetch('http://localhost:8000/auth/api/permissions/', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Status:', response.status);
    const data = await response.json();
    console.log('Respuesta del backend:', data);
    console.log('Permisos recibidos:', data.permissions?.length || 0);
    console.log('Módulos recibidos:', data.modules?.length || 0);
    console.log('Roles recibidos:', data.roles?.length || 0);
    
    return data;
  } catch (error) {
    console.error('Error en la petición:', error);
  }
}

// Exportar la función de test
window.testPermissionsEndpoint = testPermissionsEndpoint;

console.log('\n=== INSTRUCCIONES ===');
console.log('1. Haz login en la aplicación');
console.log('2. Abre la consola del navegador (F12)');
console.log('3. Ejecuta: testPermissionsEndpoint()');
console.log('4. Verifica que el backend responda correctamente');
