import axios from 'axios';

/**
 * @constant {string} API_BASE_URL
 * La URL base de tu proyecto Django.
 * Se obtiene de las variables de entorno (VITE_API_BASE_URL)
 * Fallback: 'http://localhost:8000' para desarrollo local
 */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

/**
 * @constant {string} API_PREFIX
 * El prefijo de la API tal como se define en tu urls.py: path('api/', include(router.urls))
 * Se obtiene de las variables de entorno (VITE_API_PREFIX)
 * Fallback: '/api'
 */
const API_PREFIX = import.meta.env.VITE_API_PREFIX || '/api';

/**
 * @constant {number} API_TIMEOUT
 * Timeout para las peticiones HTTP en milisegundos
 * Se obtiene de las variables de entorno (VITE_API_TIMEOUT)
 * Fallback: 10000 (10 segundos)
 */
const API_TIMEOUT = parseInt(import.meta.env.VITE_API_TIMEOUT || '10000', 10);

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
    timeout: API_TIMEOUT, 
});

/**
 * Interceptor para agregar el token JWT automáticamente en cada petición.
 */
const addAuthTokenInterceptor = (config) => {
    const token = localStorage.getItem('jwt');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
};

/**
 * Maneja el refresh del token de autenticación
 */
const handleTokenRefresh = async () => {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
        throw new Error('No refresh token available');
    }

    const response = await axios.post(
        `${API_BASE_URL}/auth/api/token/refresh/`,
        { refresh: refreshToken }
    );

    const newAccessToken = response.data.access;
    localStorage.setItem('jwt', newAccessToken);
    return newAccessToken;
};

/**
 * Redirige al usuario a la página de login
 */
const redirectToLogin = () => {
    localStorage.clear();
    window.location.href = '/login';
};

/**
 * Interceptor para manejar errores de respuesta con refresh automático
 */
const createResponseInterceptor = (axiosInstance) => async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
            const newAccessToken = await handleTokenRefresh();
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            return axiosInstance(originalRequest);
        } catch {
            redirectToLogin();
            return Promise.reject(error);
        }
    }

    return Promise.reject(error);
};

apiClient.interceptors.request.use(addAuthTokenInterceptor, (error) => Promise.reject(error));
apiClient.interceptors.response.use((response) => response, createResponseInterceptor(apiClient));

/**
 * Instancia de Axios para endpoints de autenticación (sin el prefijo /api).
 */
export const authClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: API_TIMEOUT,
    withCredentials: false,
});

/**
 * Interceptor para manejar errores de respuesta en authClient
 * Evita refresh en endpoints de login y refresh
 */
const createAuthResponseInterceptor = (axiosInstance) => async (error) => {
    const originalRequest = error.config;
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
            const newAccessToken = await handleTokenRefresh();
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            return axiosInstance(originalRequest);
        } catch {
            redirectToLogin();
            return Promise.reject(error);
        }
    }

    return Promise.reject(error);
};

authClient.interceptors.request.use(addAuthTokenInterceptor, (error) => Promise.reject(error));
authClient.interceptors.response.use((response) => response, createAuthResponseInterceptor(authClient));

export default apiClient;
