import { authClient } from '../config/apiClient';
import { AUTH_ENDPOINTS } from '../config/endpoint';
import { getUserInfoFromToken } from '../utils/jwt';

/**
 * Servicio centralizado para gestionar autenticación
 * Implementa todos los endpoints de autenticación del backend
 */
class AuthService {
  /**
   * Inicia sesión del usuario
   * @param {string} username - Nombre de usuario
   * @param {string} password - Contraseña
   * @returns {Promise<Object>} Datos del usuario autenticado
   */
  async login(username, password) {
    try {
      const response = await authClient.post(AUTH_ENDPOINTS.LOGIN, {
        username: username.toLowerCase(), // Case-insensitive
        password
      });

      const { access_token, refresh_token } = response.data;

      // Guardar tokens
      localStorage.setItem('jwt', access_token);
      if (refresh_token) {
        localStorage.setItem('refresh_token', refresh_token);
      }

      // Guardar datos del usuario
      const userInfo = getUserInfoFromToken(access_token);
      localStorage.setItem('user', JSON.stringify(userInfo));
      // Almacenar roles
      if (userInfo.roles && userInfo.roles.length > 0) {
        localStorage.setItem('user_roles', JSON.stringify(userInfo.roles));
      }
      return userInfo;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Registra una nueva solicitud de usuario
   * @param {string} username - Nombre de usuario deseado
   * @param {string} password - Contraseña
   * @param {string} ci - Cédula de identidad
   * @returns {Promise<Object>} Resultado de la solicitud
   */
  async register(username, password, ci) {
    try {
      const response = await authClient.post(AUTH_ENDPOINTS.REGISTER, {
        username,
        password,
        ci
      });

      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Cierra la sesión del usuario
   * @returns {Promise<void>}
   */
  async logout() {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        await authClient.post(AUTH_ENDPOINTS.LOGOUT, { refresh: refreshToken });
      }
    } finally {
      this.clearStorage();
    }
  }

  /**
   * Obtiene el perfil completo del usuario autenticado
   * @returns {Promise<Object>} Datos del perfil
   */
  async getProfile() {
    try {
      const response = await authClient.get(AUTH_ENDPOINTS.PROFILE);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Cambia la contraseña del usuario
   * @param {string} oldPassword - Contraseña actual
   * @param {string} newPassword - Nueva contraseña
   * @param {string} confirmPassword - Confirmación de nueva contraseña
   * @returns {Promise<Object>} Resultado del cambio
   */
  async changePassword(oldPassword, newPassword, confirmPassword) {
    try {
      const response = await authClient.post(AUTH_ENDPOINTS.CHANGE_PASSWORD, {
        old_password: oldPassword,
        new_password: newPassword,
        confirm_password: confirmPassword
      });

      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Obtiene los permisos del usuario autenticado
   * @returns {Promise<Object>} Permisos del usuario
   */
  async getPermissions() {
    try {
      const response = await authClient.get(AUTH_ENDPOINTS.PERMISSIONS);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Refresca el access token usando el refresh token
   * @returns {Promise<string>} Nuevo access token
   */
  async refreshToken() {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) {
        throw new Error('No hay refresh token disponible');
      }

      const response = await authClient.post(AUTH_ENDPOINTS.REFRESH_TOKEN, {
        refresh: refreshToken
      });

      const newAccessToken = response.data.access;
      localStorage.setItem('jwt', newAccessToken);

      return newAccessToken;
    } catch (error) {
      this.clearStorage();
      throw this.handleError(error);
    }
  }

  /**
   * Obtiene el usuario actual del localStorage
   * @returns {Object|null} Datos del usuario o null
   */
  getCurrentUser() {
    try {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  }

  /**
   * Verifica si hay una sesión activa
   * @returns {boolean} true si está autenticado
   */
  isAuthenticated() {
    return !!localStorage.getItem('jwt');
  }

  /**
   * Limpia el almacenamiento local
   */
  clearStorage() {
    localStorage.removeItem('jwt');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    localStorage.removeItem('user_roles');
    localStorage.removeItem('user_permissions');
  }

  /**
   * Maneja errores de la API
   * @param {Error} error - Error capturado
   * @returns {Error} Error formateado
   */
  handleError(error) {
    if (error.response?.data) {
      const { detail, errors } = error.response.data;
      
      if (detail) {
        return new Error(detail);
      }
      
      if (errors) {
        const errorMessages = Object.entries(errors)
          .map(([field, msgs]) => {
            const fieldLabel = this.formatFieldName(field);
            return `${fieldLabel}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`;
          })
          .join('\n');
        return new Error(errorMessages);
      }
    }
    
    return new Error(error.message || 'Error desconocido');
  }

  /**
   * Formatea el nombre de campo para mostrar
   * @param {string} field - Nombre del campo
   * @returns {string} Nombre formateado
   */
  formatFieldName(field) {
    const fieldNames = {
      'username': 'Usuario',
      'password': 'Contraseña',
      'ci': 'Cédula',
      'old_password': 'Contraseña actual',
      'new_password': 'Nueva contraseña',
      'confirm_password': 'Confirmar contraseña',
    };
    return fieldNames[field] || field.replace('_', ' ');
  }
}

export const authService = new AuthService();
