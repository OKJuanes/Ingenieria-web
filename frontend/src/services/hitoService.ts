// src/services/hitoService.ts

export interface Hito {
  id: number;
  eventoId: number; // El ID del evento al que pertenece este hito
  nombre: string;
  descripcion?: string;
  fecha: string; // Fecha del hito
  completado: boolean;
}

// Mock de datos para hitos
let mockHitos: Hito[] = [
  {
    id: 1,
    eventoId: 1, // Hito para Hackathon Innovación 2024
    nombre: 'Cierre de Inscripciones',
    fecha: '2024-06-15',
    completado: false,
  },
  {
    id: 2,
    eventoId: 1,
    nombre: 'Confirmación de Ponentes Principales',
    fecha: '2024-06-01',
    completado: true,
  },
  {
    id: 3,
    eventoId: 3, // Hito para Bootcamp Fullstack JavaScript
    nombre: 'Inicio de Sesiones',
    fecha: '2024-08-01',
    completado: false,
  },
];

// Funciones CRUD para hitos (Mocks)

export const getHitosByEventoId = async (eventoId: number): Promise<Hito[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const hitosDelEvento = mockHitos.filter(hito => hito.eventoId === eventoId);
      resolve(hitosDelEvento);
    }, 500);
  });
};

export const getHitoById = async (id: number): Promise<Hito | undefined> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockHitos.find(hito => hito.id === id));
    }, 300);
  });
};

export const createHito = async (newHito: Hito): Promise<Hito> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newId = Math.max(...mockHitos.map(h => h.id)) + 1;
      const hitoToSave = { ...newHito, id: newId };
      mockHitos.push(hitoToSave);
      // console.log("Hito creado (MOCK):", hitoToSave);
      resolve(hitoToSave);
    }, 800);
  });
};

export const updateHito = async (updatedHito: Hito): Promise<Hito> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const index = mockHitos.findIndex(h => h.id === updatedHito.id);
      if (index !== -1) {
        mockHitos[index] = { ...updatedHito };
        // console.log("Hito actualizado (MOCK):", mockHitos[index]);
        resolve(mockHitos[index]);
      } else {
        reject(new Error('Hito no encontrado para actualizar (MOCK)'));
      }
    }, 800);
  });
};

export const deleteHito = async (id: number): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const initialLength = mockHitos.length;
      mockHitos = mockHitos.filter(hito => hito.id !== id);
      if (mockHitos.length < initialLength) {
        // console.log("Hito eliminado (MOCK):", id);
        resolve(true);
      } else {
        reject(new Error('Hito no encontrado para eliminar (MOCK)'));
      }
    }, 500);
  });
};

// Función adicional para obtener todos los eventos para el select en el formulario de hito
// Podrías importar getEventos desde eventoService o duplicarlo si prefieres que hitoService sea autocontenido
// Para simplicidad, importaremos getEventos de eventoService
import { getEventos } from './eventoService';
export { getEventos }; // Exporta getEventos para usarlo en el formulario de hitos