/**
 * Decodifica un token JWT y extrae el payload
 * @param {string} token - El token JWT a decodificar
 * @returns {object|null} - El payload decodificado o null si hay error
 */
export const decodeJWT = (token) => {
  try {
    if (!token) return null;
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replaceAll('-', '+').replaceAll('_', '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.codePointAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decodificando JWT:', error);
    return null;
  }
};

/**
 * Extrae los roles del token JWT
 * @param {string} token - El token JWT
 * @returns {array} - Array de roles o array vacío si no hay roles
 */
export const getRolesFromToken = (token) => {
  const payload = decodeJWT(token);
  if (!payload) return [];
  
  // Diferentes posibles ubicaciones de roles en el payload
  // Ajusta según la estructura de tu token JWT
  return payload.roles || payload.role || payload.groups || payload.authorities || [];
};

/**
 * Extrae información del usuario del token JWT
 * @param {string} token - El token JWT
 * @returns {object} - Objeto con información del usuario
 */
export const getUserInfoFromToken = (token) => {
  const payload = decodeJWT(token);
  if (!payload) {
    return {
      username: '',
      roles: [],
      userId: null,
    };
  }

  return {
    username: payload.username || payload.user || payload.sub || payload.user_id || '',
    roles: getRolesFromToken(token),
    userId: payload.user_id || payload.id || payload.sub || null,
    email: payload.email || '',
  };
};

/**
 * Verifica si el token JWT ha expirado
 * @param {string} token - El token JWT
 * @returns {boolean} - true si el token ha expirado, false en caso contrario
 */
export const isTokenExpired = (token) => {
  const payload = decodeJWT(token);
  if (!payload || !payload.exp) return true;
  
  const currentTime = Math.floor(Date.now() / 1000);
  return payload.exp < currentTime;
};
