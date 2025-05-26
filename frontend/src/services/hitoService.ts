// src/services/hitosService.ts
import { API_URL } from '../main';
import { getToken } from './authService';
import { Evento } from './eventoService'; // Importar la interfaz Evento para la propiedad opcional 'evento'

// ¡Interfaz Hito actualizada con eventoId y completado!
export interface Hito {
  id: number;
  nombre: string;
  descripcion: string;
  fecha: string; // Formato de fecha esperado: dd-MM-yyyy (como se maneja en el formulario y servicio de eventos)
  eventoId: number; // ID del evento al que pertenece el hito
  completado: boolean; // Estado del hito (ej. completado o pendiente)
  // Opcional: Si el backend incluye la información del evento directamente en el hito
  // Si tu backend no devuelve el evento completo aquí, se necesitará una llamada adicional.
  evento?: Evento; // Esto es útil si el backend anida la información del evento.
}

// Función auxiliar para obtener los headers con el token de autenticación
const getAuthHeaders = () => {
  const token = getToken();
  if (!token) {
    console.error('No authentication token found. Please log in.');
    throw new Error('No authentication token found. Please log in.');
  }
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
};

/**
 * Obtiene todos los hitos (considerando la nueva estructura).
 * NOTA: Esta función es genérica. Si solo necesitas hitos por evento,
 * es mejor usar `getHitosByEventoId` o que el backend ofrezca una ruta '/api/milestones' sin filtro.
 * Por ahora, se mantendrá la lógica de AdminHitos.tsx que los filtra por evento.
 * No obstante, si tu backend tiene una ruta para obtener *todos* los hitos sin filtrar por evento,
 * esta función debería apuntar a esa ruta (`${API_URL}/api/milestones`).
 */
export const getHitos = async (): Promise<Hito[]> => {
  // Esta función se utiliza principalmente en AdminHitos.tsx para obtener TODOS los hitos.
  // Si tu backend tiene una ruta global para todos los hitos, úsala aquí.
  // Ejemplo: const response = await fetch(`${API_URL}/api/milestones`, { headers: getAuthHeaders() });
  // Por ahora, como AdminHitos.tsx lo maneja evento por evento,
  // esta función podría no ser estrictamente necesaria o requeriría un endpoint diferente.
  // Se deja como referencia si necesitas un endpoint global de hitos.
  console.warn("getHitos from hitosService.ts: This function might not be used directly or requires a global API endpoint for all milestones.");
  // Devolver un array vacío o lanzar un error si no hay un endpoint global
  return []; // O podrías llamar a getEventos y luego a getHitosByEventoId para cada uno, pero eso ya lo hace AdminHitos.
};


/**
 * Obtiene un hito por su ID.
 * @param id El ID del hito.
 * @returns Promise con el objeto Hito o undefined si no se encuentra.
 */
export const getHitoById = async (id: number): Promise<Hito | undefined> => {
  const response = await fetch(`${API_URL}/api/milestones/${id}`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    if (response.status === 404) {
      return undefined; // Hito no encontrado
    }
    const errorData = await response.json();
    throw new Error(errorData.message || `Error al cargar el hito con ID ${id}`);
  }
  return response.json();
};


/**
 * Obtiene todos los hitos asociados a un evento específico.
 * @param eventId El ID del evento.
 * @returns Promise con un array de objetos Hito.
 */
export const getHitosByEventoId = async (eventId: number): Promise<Hito[]> => {
  const response = await fetch(`${API_URL}/api/events/${eventId}/milestones`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || `Error al cargar los hitos del evento ${eventId}`);
  }
  return response.json();
};

/**
 * Crea un nuevo hito.
 * @param newHito El objeto Hito a crear (sin ID si el backend lo genera).
 * @returns Promise con el objeto Hito creado (incluyendo el ID).
 */
export const createHito = async (newHito: Omit<Hito, 'id'>): Promise<Hito> => {
  const response = await fetch(`${API_URL}/api/milestones`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(newHito),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Error al crear el hito');
  }
  return response.json();
};

/**
 * Actualiza un hito existente.
 * @param updatedHito El objeto Hito actualizado (con ID).
 * @returns Promise con el objeto Hito actualizado.
 */
export const updateHito = async (updatedHito: Hito): Promise<Hito> => {
  const response = await fetch(`${API_URL}/api/milestones/${updatedHito.id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(updatedHito),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || `Error al actualizar el hito con ID ${updatedHito.id}`);
  }
  return response.json();
};

/**
 * Elimina un hito por su ID.
 * @param id El ID del hito a eliminar.
 * @returns Promise<void>
 */
export const deleteHito = async (id: number): Promise<void> => {
  const response = await fetch(`${API_URL}/api/milestones/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || `Error al eliminar el hito con ID ${id}`);
  }
};

// --- NUEVA FUNCIÓN PARA EL PERFIL DEL USUARIO ---

/**
 * Obtiene todos los hitos relacionados con los eventos a los que el usuario actual está registrado.
 * @returns Promise con un array de objetos Hito.
 */
export const getHitosForCurrentUser = async (): Promise<Hito[]> => {
  // NOTA: Esta es una RUTA SUGERIDA para tu backend. ¡AJÚSTALA A TU BACKEND REAL!
  // Podría ser: /api/v1/usuarios/me/hitos o /api/v1/hitos/mis-hitos
  // Si tu backend no tiene un endpoint directo que devuelva todos los hitos del usuario,
  // la lógica del frontend debería ser más compleja:
  // 1. Obtener los eventos registrados del usuario (`getRegisteredEventsForCurrentUser` de eventoService.ts).
  // 2. Para cada evento, obtener sus hitos (`getHitosByEventoId`).
  // 3. Consolidar todos los hitos y quizás agregar la información del evento a cada hito.

  // Suponemos que el backend tiene un endpoint directo para "mis hitos":
  const response = await fetch(`${API_URL}/api/v1/hitos/mis-hitos`, { // <--- ¡VERIFICA Y AJUSTA ESTA RUTA!
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    // Si la respuesta no es OK, intenta parsear el error.
    // Usamos .catch(() => ...) para manejar casos donde la respuesta no es JSON (ej. 500 Internal Server Error con HTML)
    const errorData = await response.json().catch(() => ({ message: 'Error desconocido al cargar hitos del usuario' }));
    throw new Error(errorData.message || 'Error al cargar los hitos del usuario.');
  }
  return response.json();
};