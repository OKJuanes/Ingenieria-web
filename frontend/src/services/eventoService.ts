// src/services/eventoService.ts

import { API_URL } from '../main';

import { getToken } from './authService';



// Funciones de formato de fecha

export const formatDateForBackend = (dateStr: string): string => {

 if (!dateStr) return '';

 // Convierte YYYY-MM-DD a dd-MM-yyyy

 const [year, month, day] = dateStr.split('-');

 return `${day}-${month}-${year}`;

};



export const formatDateForFrontend = (dateStr: string): string => {

 if (!dateStr) return '';

 // Convierte dd-MM-yyyy a YYYY-MM-DD

 const [day, month, year] = dateStr.split('-');

 return `${year}-${month}-${day}`;

};



// Interfaz Evento (asegúrate de que coincida con la estructura que tu backend devuelve/espera)

export interface Evento {

 id: number;

 nombre: string;

 descripcion: string;

 fecha: string;

 tipo: string;

 participantes?: string[]; // <- Añadir esta propiedad si no existe

 invitados?: string[];

 invitadosExternos?: string[];

 empresa?: string;

 cantidadParticipantes?: number;

}



/**

* Interfaz para los datos de un participante de evento

*/

export interface ParticipanteEvento {

 id: number;

 username: string;

 nombre: string;

 apellido: string;

 correo: string;

 role: string;

}



// Función auxiliar para obtener los headers con el token de autenticación

const getAuthHeaders = () => {

 const token = getToken();

 return {

  'Content-Type': 'application/json',

  'Authorization': token ? `Bearer ${token}` : '',

 };

};



/**

* Obtiene estadísticas generales de eventos.

* @returns Promise con un objeto de estadísticas.

*/

export const getEventStats = async (): Promise<{ eventosActivos: number; totalParticipantes: number; proximoEvento: string }> => {
  try {
    // 1. Obtener eventos activos
    let eventosActivos = 0;
    try {
      const countResponse = await fetch(`${API_URL}/api/v1/eventos/activos/count`, { 
        headers: getAuthHeaders() 
      });
      
      if (countResponse.ok) {
        eventosActivos = await countResponse.json();
      } else {
        console.error('Error al obtener cantidad de eventos activos:', await countResponse.text());
      }
    } catch (error) {
      console.error('Error en fetch eventos activos:', error);
    }
    
    // 2. Obtener participantes
    let totalParticipantes = 0;
    try {
      const totalParticipantesResponse = await fetch(`${API_URL}/api/v1/eventos/activos/total-participantes`, { 
        headers: getAuthHeaders() 
      });
      
      if (totalParticipantesResponse.ok) {
        totalParticipantes = await totalParticipantesResponse.json();
      } else {
        console.error('Error al obtener participantes:', await totalParticipantesResponse.text());
      }
    } catch (error) {
      console.error('Error en fetch participantes:', error);
    }
    
    // 3. Obtener próximo evento
    let proximoEvento = 'Sin eventos próximos';
    try {
      const proximoResponse = await fetch(`${API_URL}/api/v1/eventos/proximo`, { 
        headers: getAuthHeaders() 
      });
      
      if (proximoResponse.ok) {
        const eventoData = await proximoResponse.json();
        proximoEvento = eventoData?.nombre || 'Sin eventos próximos';
      } else {
        console.error('Error al obtener próximo evento:', await proximoResponse.text());
      }
    } catch (error) {
      console.error('Error en fetch próximo evento:', error);
    }

    return {
      eventosActivos,
      totalParticipantes,
      proximoEvento
    };
  } catch (error) {
    console.error('Error general en getEventStats:', error);
    throw new Error('Error al cargar las estadísticas');
  }
};



/**

* Obtiene una lista de eventos recientes.

* @param limit El número máximo de eventos a devolver.

* @returns Promise con un array de objetos Evento.

*/

export const getRecentEvents = async (limit: number = 3): Promise<Evento[]> => {

 const response = await fetch(`${API_URL}/api/v1/eventos/activos3?limit=${limit}`, {

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

 const response = await fetch(`${API_URL}/api/v1/eventos/activos`, {

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

export const getEventoById = async (id: number): Promise<Evento> => {

 const response = await fetch(`${API_URL}/api/v1/eventos/${id}`, {

  headers: getAuthHeaders(),

 });



 if (!response.ok) {

  const errorData = await response.json().catch(() => ({ message: 'Error al obtener evento' }));

  throw new Error(errorData.message || `Error al obtener evento con ID ${id}`);

 }



 return response.json();

};



/**

* Crea un nuevo evento.

* @param newEvent El objeto Evento a crear (sin ID si el backend lo genera).

* @returns Promise con el objeto Evento creado (incluyendo el ID).

*/

export const createEvent = async (newEvent: Omit<Evento, 'id'>): Promise<Evento> => {

 const token = getToken();

 try {

  if (!token) {
   console.warn("No token found for decoding.");
  }

 } catch (e) {

  console.error("Error decoding token:", e);

 }



 // Copia y formatea la fecha antes de enviar

 const eventToSend = {

  ...newEvent,

  fecha: formatDateForBackend(newEvent.fecha)

 };



 const response = await fetch(`${API_URL}/api/v1/eventos/nuevo-evento`, {

  method: 'POST',

  headers: getAuthHeaders(),

  body: JSON.stringify(eventToSend),

 });

 if (!response.ok) {

  if (response.status === 403) {

   throw new Error("No tienes permisos para crear eventos. Verifica tu rol de usuario.");

  }

 

  // Intentar leer el cuerpo de respuesta solo si hay contenido

  const text = await response.text();

  const errorData = text ? JSON.parse(text) : {};

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
  // Extraer solo los campos permitidos para la actualización
  const eventToUpdate = {
    id: updatedEvent.id,
    nombre: updatedEvent.nombre,
    descripcion: updatedEvent.descripcion,
    tipo: updatedEvent.tipo,
    fecha: formatDateForBackend(updatedEvent.fecha), // Formatear la fecha correctamente
    empresa: updatedEvent.empresa
  };

  const response = await fetch(`${API_URL}/api/v1/eventos/${updatedEvent.id}/modificar-evento`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(eventToUpdate),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Error al actualizar el evento' }));
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

 const response = await fetch(`${API_URL}/api/v1/eventos/${eventId}/inscribirse`, {

  method: 'PUT',

  headers: getAuthHeaders(),

 });



 if (!response.ok) {

  const errorData = await response.json().catch(() => ({ message: 'Error al registrarse en el evento' }));

  throw new Error(errorData.message || `Error al registrarse en el evento ${eventId}`);

 }

};



export const unregisterUserFromEvent = async (eventId: number): Promise<void> => {

 const response = await fetch(`${API_URL}/api/v1/eventos/${eventId}/eliminar-participante`, {

  method: 'DELETE',

  headers: getAuthHeaders(),

 });



 if (!response.ok) {

  const errorData = await response.json().catch(() => ({ message: 'Error al desinscribirse del evento' }));

  throw new Error(errorData.message || `Error al desinscribirse del evento ${eventId}`);

 }

};



/**

* Obtiene los eventos a los que el usuario autenticado está registrado.

* @returns Promise con un array de objetos Evento.

*/

export const getRegisteredEventsForCurrentUser = async (): Promise<Evento[]> => {

 // La ruta actual no existe: /api/users/me/events

 // Cambia a la ruta correcta de tu backend:

 const response = await fetch(`${API_URL}/api/v1/eventos/mis-eventos`, {

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



/**
 * @param eventoId ID del evento
 * @returns Promise con array de objetos ParticipanteEvento
 */
export const getParticipantesByEventoId = async (eventoId: number): Promise<ParticipanteEvento[]> => {
  const response = await fetch(`${API_URL}/api/v1/eventos/${eventoId}/participantes`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
    },
  });

  if (!response.ok) {

    const errorData = await response.json().catch(() => ({}));

    throw new Error(errorData.message || `Error al obtener participantes del evento ${eventoId}`);

  }

  return response.json();

};



/**

 * Añade un invitado externo a un evento específico

 * @param eventoId ID del evento

 * @param invitadoData Datos del invitado externo

 * @returns Promise con los datos del invitado añadido

 */

export const addExternalGuest = async (eventoId: number, invitadoData: {

  nombre: string;

  apellido: string;

  correo: string;

  telefono?: string;

  empresa?: string;  // Asegúrate de incluir esta propiedad

}): Promise<any> => {

  const response = await fetch(`${API_URL}/api/v1/eventos/${eventoId}/invitados-externos`, {

    method: 'POST',

    headers: getAuthHeaders(),

    body: JSON.stringify(invitadoData),

  });



  if (!response.ok) {

    const errorText = await response.text();

    try {

      const errorData = errorText ? JSON.parse(errorText) : {};

      throw new Error(errorData.message || 'Error al añadir invitado externo');

    } catch (e) {

      throw new Error(`Error al añadir invitado externo: ${response.statusText}`);

    }

  }



  return response.json();

};



/**

 * Elimina un evento existente.

 * @param id El ID del evento a eliminar.

 * @returns Promise<void>

 */

export const deleteEvento = async (id: number): Promise<void> => {
  const response = await fetch(`${API_URL}/api/v1/eventos/${id}/eliminar-evento`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    // Intentamos obtener el mensaje de error del cuerpo de la respuesta
    try {
      const errorData = await response.json();
      throw new Error(errorData.message || `Error al eliminar el evento con ID ${id}`);
    } catch (jsonError) {
      // Si no podemos parsear el JSON, usamos el statusText
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
  }
};



/**

 * Obtiene el histórico completo de todos los eventos

 * @returns Promise con un array de objetos Evento

 */

export const getEventosHistorico = async (): Promise<Evento[]> => {

  const response = await fetch(`${API_URL}/api/v1/eventos/historico`, {

    headers: getAuthHeaders(),

  });



  if (!response.ok) {

    const errorData = await response.json();

    throw new Error(errorData.message || 'Error al cargar el histórico de eventos');

  }



  return response.json();

};