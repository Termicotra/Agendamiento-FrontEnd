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

export default apiClient;
