// Configuración base para todas las peticiones a la API

const API_BASE_URL = 'http://localhost:8000/app/api';

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: any;
};

/**
 * Función genérica para hacer peticiones a la API
 */
async function apiRequest<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', headers = {}, body } = options;

  const config: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  };

  if (body && method !== 'GET') {
    config.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `Error ${response.status}: ${response.statusText}`);
    }

    // Si es DELETE, no hay contenido en la respuesta
    if (method === 'DELETE') {
      return {} as T;
    }

    return await response.json();
  } catch (error) {
    console.error('Error en la petición:', error);
    throw error;
  }
}

export { apiRequest, API_BASE_URL };