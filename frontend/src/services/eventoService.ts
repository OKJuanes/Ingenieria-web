// src/services/eventoService.ts
import { API_URL } from '../main';
import { getToken } from './authService';

// Interfaz Evento (asegúrate de que coincida con la estructura que tu backend devuelve/espera)
export interface Evento {
  id: number;
  nombre: string;
  tipo: string;
  fecha: string; // Considera usar Date si tu backend devuelve un formato ISO. Para el formulario, string está bien.
  descripcion: string;
  cantidadParticipantes?: number;
  empresaPatrocinadora?: string;
  invitadosExternos?: string[]; // Nombres o identificadores de invitados externos (string)
  invitados?: string[]; // Estos deberían ser los IDs de los usuarios de tu BD, ej. string[] de UUIDs o number[]
}

// Función auxiliar para obtener los headers con el token de autenticación
const getAuthHeaders = () => {
  const token = getToken();
  if (!token) {
    // Si no hay token, el usuario no está autenticado, puedes redirigir o lanzar un error
    // En un entorno de producción, esto podría ser un error más grave.
    console.error('No authentication token found. Please log in.');
    throw new Error('No authentication token found. Please log in.');
  }
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
};

/**
 * Obtiene estadísticas generales de eventos.
 * @returns Promise con un objeto de estadísticas.
 */
export const getEventStats = async (): Promise<{ eventosActivos: number; totalParticipantes: number; proximoEvento: string }> => {
  const response = await fetch(`${API_URL}/api/events/stats`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Error al cargar las estadísticas de eventos');
  }
  return response.json();
};

/**
 * Obtiene una lista de eventos recientes.
 * @param limit El número máximo de eventos a devolver.
 * @returns Promise con un array de objetos Evento.
 */
export const getRecentEvents = async (limit: number = 3): Promise<Evento[]> => {
  const response = await fetch(`${API_URL}/api/events/recent/${limit}`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Error al cargar los eventos recientes');
  }
  return response.json();
};

/**
 * Obtiene todos los eventos disponibles.
 * @returns Promise con un array de objetos Evento.
 */
export const getEventos = async (): Promise<Evento[]> => {
  const response = await fetch(`${API_URL}/api/events`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Error al cargar todos los eventos');
  }
  return response.json();
};

/**
 * Obtiene un evento por su ID.
 * @param id El ID del evento.
 * @returns Promise con el objeto Evento o undefined si no se encuentra.
 */
export const getEventoById = async (id: number): Promise<Evento | undefined> => {
  const response = await fetch(`${API_URL}/api/events/${id}`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    if (response.status === 404) {
      return undefined; // Evento no encontrado
    }
    const errorData = await response.json();
    throw new Error(errorData.message || `Error al cargar el evento con ID ${id}`);
  }
  return response.json();
};

/**
 * Crea un nuevo evento.
 * @param newEvent El objeto Evento a crear (sin ID si el backend lo genera).
 * @returns Promise con el objeto Evento creado (incluyendo el ID).
 */
export const createEvent = async (newEvent: Omit<Evento, 'id'>): Promise<Evento> => {
  const response = await fetch(`${API_URL}/api/events`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(newEvent),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Error al crear el evento');
  }
  return response.json();
};

/**
 * Actualiza un evento existente.
 * @param updatedEvent El objeto Evento actualizado (con ID).
 * @returns Promise con el objeto Evento actualizado.
 */
export const updateEvent = async (updatedEvent: Evento): Promise<Evento> => {
  const response = await fetch(`${API_URL}/api/events/${updatedEvent.id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(updatedEvent),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || `Error al actualizar el evento con ID ${updatedEvent.id}`);
  }
  return response.json();
};

/**
 * Registra al usuario autenticado en un evento.
 * @param eventId El ID del evento al que registrarse.
 * @returns Promise<void>
 */
export const registerUserToEvent = async (eventId: number): Promise<void> => {
  const response = await fetch(`${API_URL}/api/events/${eventId}/register`, {
    method: 'POST',
    headers: getAuthHeaders(),
    // Asumimos que el backend identifica al usuario por el token JWT
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || `Error al registrarse en el evento ${eventId}`);
  }
};

/**
 * Desinscribe al usuario autenticado de un evento.
 * @param eventId El ID del evento del que desinscribirse.
 * @returns Promise<void>
 */
export const unregisterUserFromEvent = async (eventId: number): Promise<void> => {
  const response = await fetch(`${API_URL}/api/events/${eventId}/unregister`, {
    method: 'DELETE', // DELETE es más RESTful para desinscripción, pero tu backend podría usar POST
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || `Error al desinscribirse del evento ${eventId}`);
  }
};

/**
 * Obtiene los eventos a los que el usuario autenticado está registrado.
 * @returns Promise con un array de objetos Evento.
 */
export const getRegisteredEventsForCurrentUser = async (): Promise<Evento[]> => {
  // Asumimos que el backend tiene una ruta para obtener los eventos del usuario actual
  const response = await fetch(`${API_URL}/api/users/me/events`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Error al cargar tus eventos registrados.');
  }
  return response.json();
};

/**
 * Genera un reporte CSV de eventos y participantes.
 * @returns Promise con el contenido del reporte CSV como una cadena de texto.
 */
export const generateEventsReportCsv = async (): Promise<string> => {
  const response = await fetch(`${API_URL}/api/reports/events-participants-csv`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Error al generar el reporte CSV');
  }
  return response.text(); // El backend debe devolver el contenido CSV directamente como texto plano
};