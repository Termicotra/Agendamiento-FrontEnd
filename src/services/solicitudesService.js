import { authClient } from '../config/apiClient';
import { AUTH_ENDPOINTS } from '../config/endpoint';

/**
 * Servicio para gestionar solicitudes de registro (solo administradores)
 */
class SolicitudesService {
  /**
   * Obtiene la lista de solicitudes de registro
   * @param {string|null} estado - Filtrar por estado (pendiente, aprobada, rechazada)
   * @returns {Promise<Object>} Lista de solicitudes
   */
  async listarSolicitudes(estado = null) {
    try {
      const params = estado ? { estado } : {};
      const response = await authClient.get(AUTH_ENDPOINTS.SOLICITUDES, { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Aprueba una solicitud de registro
   * @param {number} solicitudId - ID de la solicitud
   * @param {string} group - Grupo a asignar (pacientes, profesionales, empleados, administradores)
   * @returns {Promise<Object>} Resultado de la aprobación
   */
  async aprobarSolicitud(solicitudId, group) {
    try {
      const response = await authClient.post(
        AUTH_ENDPOINTS.SOLICITUD_APROBAR(solicitudId),
        { group }
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Rechaza una solicitud de registro
   * @param {number} solicitudId - ID de la solicitud
   * @returns {Promise<Object>} Resultado del rechazo
   */
  async rechazarSolicitud(solicitudId) {
    try {
      const response = await authClient.post(
        AUTH_ENDPOINTS.SOLICITUD_RECHAZAR(solicitudId)
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Maneja errores de la API
   * @param {Error} error - Error capturado
   * @returns {Error} Error formateado
   */
  handleError(error) {
    if (error.response?.data?.detail) {
      return new Error(error.response.data.detail);
    }
    if (error.response?.data?.errors) {
      const errors = error.response.data.errors;
      const errorMessages = Object.entries(errors)
        .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
        .join('\n');
      return new Error(errorMessages);
    }
    return new Error(error.message || 'Error en la solicitud');
  }
}

export const solicitudesService = new SolicitudesService();
