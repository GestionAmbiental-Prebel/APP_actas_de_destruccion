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

  console.log(`=== ${method} ${API_BASE_URL}${endpoint} ===`);
  console.log('Body:', body);

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);

    // Si es DELETE exitoso, no hay contenido
    if (method === 'DELETE' && response.ok) {
      return {} as T;
    }

    // Intentar leer la respuesta UNA SOLA VEZ
    const responseText = await response.text();
    console.log('Response text:', responseText);

    // Si la respuesta no es OK, lanzar error
    if (!response.ok) {
      let errorMessage = `Error ${response.status}`;
      
      try {
        const errorData = JSON.parse(responseText);
        errorMessage += `: ${JSON.stringify(errorData, null, 2)}`;
      } catch {
        errorMessage += `: ${responseText}`;
      }
      
      throw new Error(errorMessage);
    }

    // Si es OK, parsear el JSON
    try {
      const data = JSON.parse(responseText);
      console.log('Response data:', data);
      return data;
    } catch {
      // Si no es JSON válido pero la respuesta fue exitosa
      return {} as T;
    }

  } catch (error) {
    console.error('Error en la petición:', error);
    throw error;
  }
}

export { apiRequest, API_BASE_URL };