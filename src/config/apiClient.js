import axios from 'axios';

/**
 * @constant {string} API_BASE_URL
 * La URL base de tu proyecto Django.
 * Por defecto, usamos 'http://localhost:8000' si estás ejecutando Django localmente.
 * Si despliegas el backend, esta URL debe cambiar.
 */
const API_BASE_URL = 'http://localhost:8000'; 

/**
 * @constant {string} API_PREFIX
 * El prefijo de la API tal como se define en tu urls.py: path('api/', include(router.urls))
 */
const API_PREFIX = '/api';

/**
 * @constant {string} BASE_API_URL
 * URL base completa para todas las peticiones a la API.
 */
export const BASE_API_URL = `${API_BASE_URL}${API_PREFIX}`;

/**
 * @constant {AxiosInstance} apiClient
 * Instancia de Axios preconfigurada para interactuar con la API de Django REST.
 */
const apiClient = axios.create({
    baseURL: BASE_API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 5000, 
});

/**
 * Interceptor para agregar el token JWT automáticamente en cada petición.
 * También maneja el refresh automático de tokens expirados.
 */
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('jwt');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

/**
 * Interceptor para manejar errores de respuesta.
 * Implementa refresh automático de tokens cuando expiran (401).
 */
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Si es error 401 y no hemos intentado refresh aún
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = localStorage.getItem('refresh_token');
                if (!refreshToken) {
                    // No hay refresh token, redirigir a login
                    localStorage.clear();
                    window.location.href = '/login';
                    return Promise.reject(error);
                }

                // Intentar obtener nuevo access token
                const response = await axios.post(
                    `${API_BASE_URL}/auth/api/token/refresh/`,
                    { refresh: refreshToken }
                );

                const newAccessToken = response.data.access;
                localStorage.setItem('jwt', newAccessToken);

                // Reintentar la petición original con el nuevo token
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                return apiClient(originalRequest);
            } catch (refreshError) {
                // Refresh falló, limpiar storage y redirigir a login
                localStorage.clear();
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

/**
 * Instancia de Axios para endpoints de autenticación (sin el prefijo /api).
 */
export const authClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000,
    withCredentials: false,
});

/**
 * Interceptor para agregar el token JWT automáticamente en peticiones de authClient.
 * También maneja el refresh automático de tokens expirados.
 */
authClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('jwt');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

/**
 * Interceptor para manejar errores de respuesta en authClient.
 */
authClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Para authClient, solo intentamos refresh si no es la ruta de login o refresh
        const isLoginEndpoint = originalRequest.url?.includes('/login');
        const isRefreshEndpoint = originalRequest.url?.includes('/token/refresh');

        if (
            error.response?.status === 401 &&
            !originalRequest._retry &&
            !isLoginEndpoint &&
            !isRefreshEndpoint
        ) {
            originalRequest._retry = true;

            try {
                const refreshToken = localStorage.getItem('refresh_token');
                if (!refreshToken) {
                    localStorage.clear();
                    window.location.href = '/login';
                    return Promise.reject(error);
                }

                const response = await axios.post(
                    `${API_BASE_URL}/auth/api/token/refresh/`,
                    { refresh: refreshToken }
                );

                const newAccessToken = response.data.access;
                localStorage.setItem('jwt', newAccessToken);

                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                return authClient(originalRequest);
            } catch (refreshError) {
                localStorage.clear();
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default apiClient;
