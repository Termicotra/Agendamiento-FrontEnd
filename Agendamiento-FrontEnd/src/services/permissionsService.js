import { authClient } from '../config/apiClient';
import { AUTH_ENDPOINTS } from '../config/endpoint';

/**
 * Servicio para gestionar permisos del usuario
 */
class PermissionsService {
  /**
   * Obtiene los permisos del usuario desde el backend
   * @returns {Promise<Object>} Objeto con permisos del usuario
   * Formato esperado del backend:
   * {
   *   permissions: ["turnos.view", "pacientes.create", ...],
   *   modules: ["turnos", "pacientes", ...],
   *   roles: ["admin", "doctor", ...]
   * }
   */
  async fetchUserPermissions() {
    try {
      const response = await authClient.get(AUTH_ENDPOINTS.PERMISSIONS);
      return {
        permissions: response.data.permissions || [],
        modules: response.data.modules || [],
        roles: response.data.roles || [],
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error al obtener permisos del backend:', error);
      throw error;
    }
  }

  /**
   * Guarda los permisos en localStorage
   * @param {Object} permissionsData - Datos de permisos a guardar
   */
  savePermissionsToStorage(permissionsData) {
    try {
      localStorage.setItem('user_permissions', JSON.stringify(permissionsData));
    } catch (error) {
      console.error('Error al guardar permisos en localStorage:', error);
    }
  }

  /**
   * Obtiene los permisos desde localStorage
   * @returns {Object|null} Datos de permisos o null si no existen
   */
  getPermissionsFromStorage() {
    try {
      const stored = localStorage.getItem('user_permissions');
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Error al leer permisos de localStorage:', error);
      return null;
    }
  }

  /**
   * Limpia los permisos del localStorage
   */
  clearPermissions() {
    try {
      localStorage.removeItem('user_permissions');
    } catch (error) {
      console.error('Error al limpiar permisos:', error);
    }
  }

  /**
   * Verifica si los permisos en caché están vigentes (menos de 5 minutos)
   * @param {string} timestamp - Timestamp de cuando se guardaron los permisos
   * @returns {boolean} true si están vigentes
   */
  arePermissionsValid(timestamp) {
    if (!timestamp) return false;
    const savedTime = new Date(timestamp).getTime();
    const currentTime = Date.now();
    const fiveMinutes = 5 * 60 * 1000;
    return (currentTime - savedTime) < fiveMinutes;
  }

  /**
   * Obtiene permisos, primero del caché y si no son válidos del backend
   * @param {boolean} forceRefresh - Forzar actualización desde el backend
   * @returns {Promise<Object>} Datos de permisos
   */
  async getPermissions(forceRefresh = false) {
    if (!forceRefresh) {
      const cached = this.getPermissionsFromStorage();
      if (cached && this.arePermissionsValid(cached.timestamp)) {
        return cached;
      }
    }

    // Si no hay caché válido o se fuerza refresh, obtener del backend
    const permissions = await this.fetchUserPermissions();
    this.savePermissionsToStorage(permissions);
    return permissions;
  }
}

export const permissionsService = new PermissionsService();
