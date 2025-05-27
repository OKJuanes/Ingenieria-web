// src/services/hitoService.ts
import { API_URL } from '../main';
import { getToken } from './authService';

// Interfaz Hito actualizada para mantener compatibilidad con todas las páginas
export interface Hito {
  id: number;
  titulo: string;
  descripcion: string;
  categoria: string;
  fechaRegistro: string;
  eventoId: number;    // Mantener consistente con las páginas existentes
  usuarioGanadorId?: number;  // Para MisHitos.tsx
  eventoNombre?: string;  // Opcional, para mostrar nombres de eventos directamente
  completado: boolean;
  userId?: number;  // Para compatibilidad con HitoForm
  beneficiario?: {
    id: number;
    username: string;
    nombre?: string;
    apellido?: string;
  };
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
 * Obtiene un hito por su ID.
 * @param id El ID del hito.
 * @returns Promise con el objeto Hito o undefined si no se encuentra.
 */
export const getHitoById = async (id: number): Promise<Hito | undefined> => {
  const response = await fetch(`${API_URL}/api/v1/hitos/${id}`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    if (response.status === 404) {
      return undefined; // Hito no encontrado
    }
    
    // Mejorar el manejo de errores para detectar problemas JSON
    try {
      const text = await response.text();
      const errorData = text ? JSON.parse(text) : {};
      throw new Error(errorData.message || `Error al cargar el hito con ID ${id}`);
    } catch (err) {
      console.error("Error parsing response:", err);
      throw new Error(`Error al cargar el hito con ID ${id}: Respuesta inválida del servidor`);
    }
  }

  // Usar text() y luego parse para manejar mejor errores de JSON
  try {
    const text = await response.text();
    return text ? JSON.parse(text) : undefined;
  } catch (err) {
    console.error("Error parsing hito data:", err);
    throw new Error(`Error al procesar datos del hito: formato inválido`);
  }
};

/**
 * Obtiene todos los hitos asociados a un evento específico.
 * @param eventId El ID del evento.
 * @returns Promise con un array de objetos Hito.
 */
export const getHitosByEventoId = async (eventId: number): Promise<Hito[]> => {
  if (!eventId || isNaN(eventId)) {
    throw new Error('ID de evento inválido');
  }
  
  const response = await fetch(`${API_URL}/api/v1/hitos/evento/${eventId}`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Error al cargar los hitos del evento ${eventId}`);
  }

  return response.json();
};

/**
 * Crea un nuevo hito.
 * @param eventoId ID del evento asociado
 * @param newHito El objeto Hito a crear (sin ID)
 * @returns Promise con el objeto Hito creado (incluyendo el ID)
 */
export const createHito = async (eventoId: number, newHito: Omit<Hito, 'id'>): Promise<Hito> => {
  if (!eventoId || isNaN(eventoId)) {
    throw new Error('ID de evento inválido');
  }
  
  // Generar fecha actual en formato ISO (YYYY-MM-DD)
  const today = new Date();
  const fechaActual = today.toISOString().split('T')[0];
  
  // Crear una copia del objeto con la fecha actualizada
  const hitoConFechaActual = {
    ...newHito,
    fechaRegistro: fechaActual
  };
  
  const response = await fetch(`${API_URL}/api/v1/hitos/${eventoId}/logro`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(hitoConFechaActual),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Error al crear el hito');
  }

  return response.json();
};

/**
 * Actualiza un hito existente.
 * @param hitoData El objeto Hito actualizado (con ID)
 * @returns Promise con el objeto Hito actualizado
 */
export const updateHito = async (hitoData: Hito): Promise<Hito> => {
  const response = await fetch(`${API_URL}/api/v1/hitos/${hitoData.id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(hitoData),
  });

  if (!response.ok) {
    // Usar text() para obtener la respuesta completa, luego intentar parsear como JSON
    const errorText = await response.text();
    console.error("Error response:", errorText);
    try {
      const errorData = errorText ? JSON.parse(errorText) : {};
      throw new Error(errorData.message || `Error al actualizar el hito con ID ${hitoData.id}`);
    } catch (e) {
      throw new Error(`Error al actualizar el hito: ${response.statusText}`);
    }
  }

  return response.json();
};

/**
 * Elimina un hito por su ID.
 * @param id El ID del hito a eliminar
 * @returns Promise<void>
 */
export const deleteHito = async (id: number): Promise<void> => {
  const response = await fetch(`${API_URL}/api/v1/hitos/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Error al eliminar el hito con ID ${id}`);
  }
};

/**
 * Obtiene todos los hitos del sistema
 * @returns Promise con el array de todos los hitos
 */
export const getAllHitos = async (): Promise<Hito[]> => {
  const response = await fetch(`${API_URL}/api/v1/hitos`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Error al obtener los hitos');
  }

  return response.json();
};

/**
 * Obtiene los hitos ganados por el usuario actualmente autenticado
 * @returns Promise con array de hitos ganados por el usuario
 */
export const getMisHitosGanados = async (): Promise<Hito[]> => {
  const response = await fetch(`${API_URL}/api/v1/usuario/mis-hitos-ganados`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Error al obtener tus hitos ganados');
  }

  // Obtener los hitos del backend
  const hitos = await response.json();
  console.log("Hitos recibidos del backend:", hitos); // Para depuración
  
  // Transformar los datos para asegurar consistencia
  return Promise.all(hitos.map(async (hito: any) => {
    // Si tenemos el eventoId pero no el nombre, intentar obtenerlo
    if (hito.eventoId && (!hito.eventoNombre && !hito.evento?.nombre)) {
      try {
        // Aquí podrías hacer una llamada adicional para obtener el nombre del evento
        // por ejemplo: const evento = await getEventoById(hito.eventoId);
        // y luego usar evento.nombre
      } catch (err) {
        console.error(`Error al obtener nombre del evento ${hito.eventoId}:`, err);
      }
    }
    
    return {
      ...hito,
      fechaRegistro: formatDateForFrontend(hito.fechaRegistro || ''),
      eventoNombre: hito.eventoNombre || 
                    (hito.evento ? hito.evento.nombre : '') || 
                    (hito.eventoRelacionado ? hito.eventoRelacionado.nombre : '')
    };
  }));
};

// Función auxiliar para normalizar el formato de fecha
const formatDateForFrontend = (dateStr: string): string => {
  if (!dateStr) return '';
  
  try {
    // Si es un timestamp o fecha en milisegundos
    if (!isNaN(Number(dateStr))) {
      const date = new Date(Number(dateStr));
      return date.toISOString().split('T')[0];
    }
    
    // Si la fecha ya está en formato ISO (yyyy-MM-dd), devolverla
    if (/^\d{4}-\d{2}-\d{2}/.test(dateStr)) return dateStr;
    
    // Intentar convertir desde formato dd-MM-yyyy a formato ISO
    const [day, month, year] = dateStr.split('-');
    if (day && month && year && day.length === 2) {
      return `${year}-${month}-${day}`;
    }
    
    // Si es una fecha en formato de texto, intentar convertir
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0];
    }
    
    // Si nada funciona, devolver la fecha actual
    return new Date().toISOString().split('T')[0];
  } catch (e) {
    console.error("Error procesando fecha:", e, "Valor recibido:", dateStr);
    // Si hay error, devolver fecha actual como último recurso
    return new Date().toISOString().split('T')[0];
  }
};