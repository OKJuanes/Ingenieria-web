// src/services/eventoService.ts
import { mockUsers } from './authService';
// Define la interfaz para la estructura de un evento
export interface Evento {
    id: number;
    nombre: string;
    tipo: string;
    fecha: string;
    descripcion: string;
    cantidadParticipantes?: number;
    empresaPatrocinadora?: string;
    invitadosExternos?: string[];
    invitados?: string[];
    // Añade aquí cualquier otro campo que tu backend vaya a devolver para un evento
  }
  
  // ==========================================================
  // MOCKS TEMPORALES PARA DATOS DE EVENTOS SIN BACKEND
  // ¡RECUERDA ELIMINAR O REVERTIR ESTO CUANDO CONECTES EL BACKEND REAL!
  // ==========================================================
  
  const mockEventos: Evento[] = [
    {
      id: 1,
      nombre: 'Hackathon Innovación 2024',
      tipo: 'Hackathon',
      fecha: '2024-06-20',
      descripcion: 'Desarrolla soluciones creativas para problemas del mundo real en 48 horas.',
      cantidadParticipantes: 250,
      empresaPatrocinadora: 'TecnoCorp',
      invitadosExternos: ['Dra. Ana García (Experta en IA)', 'Ing. Luis Pérez (Desarrollador Senior)'],
      invitados: ["user", "admin"], // Estos podrían ser IDs o nombres de usuarios internos
    },
    {
      id: 2,
      nombre: 'Conferencia de Ciberseguridad',
      tipo: 'Conferencia',
      fecha: '2024-07-10',
      descripcion: 'Aprende las últimas tendencias en seguridad informática y protección de datos.',
      cantidadParticipantes: 180,
      empresaPatrocinadora: 'SecureData',
      invitadosExternos: ['Dr. Carlos Soto (Consultor de Seguridad)', 'Lic. Marta Ríos (Auditora Forense)'],
      invitados: ["user", "admin"],
    },
    {
      id: 3,
      nombre: 'Bootcamp Fullstack JavaScript',
      tipo: 'Bootcamp',
      fecha: '2024-08-01',
      descripcion: 'Intensivo de 3 meses para dominar el desarrollo frontend y backend con JavaScript.',
      cantidadParticipantes: 80,
      empresaPatrocinadora: 'CodeMaster',
      invitadosExternos: [],
      invitados: ["user", "admin"],
    },
    {
      id: 4,
      nombre: 'Taller de Diseño UX/UI',
      tipo: 'Taller',
      fecha: '2024-09-15',
      descripcion: 'Diseña interfaces de usuario intuitivas y experiencias de usuario atractivas.',
      cantidadParticipantes: 50,
      empresaPatrocinadora: 'CreativeLabs',
      invitadosExternos: ['Diseñadora Clara Luna'],
      invitados: ["user", "admin"],
    },
  ];
  // === NUEVAS FUNCIONES PARA HOMEADMIN ===

// Función para obtener un resumen de estadísticas de eventos
export const getEventStats = async (): Promise<{ eventosActivos: number; totalParticipantes: number; proximoEvento: string }> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const eventosActivos = mockEventos.length;
      const totalParticipantes = mockEventos.reduce((sum, evento) => sum + (evento.cantidadParticipantes || 0), 0);

      // Encontrar el próximo evento (basado en la fecha y que no haya pasado)
      const now = new Date();
      const eventosFuturos = mockEventos.filter(evento => new Date(evento.fecha) > now);
      
      eventosFuturos.sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());

      const proximoEvento = eventosFuturos.length > 0
        ? `${eventosFuturos[0].nombre} - ${eventosFuturos[0].fecha}`
        : 'No hay próximos eventos registrados';

      resolve({
        eventosActivos,
        totalParticipantes,
        proximoEvento,
      });
    }, 800); // Simula un retardo de red
  });
};

// Función para obtener una lista de eventos recientes (ej. los últimos 5 por fecha)
export const getRecentEvents = async (limit: number = 5): Promise<Evento[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Ordena los eventos por fecha de forma descendente y toma los 'limit' más recientes
      const sortedEvents = [...mockEventos].sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
      const recentEvents = sortedEvents.slice(0, limit);
      resolve(recentEvents);
    }, 700);
  });
};
  // Función para obtener todos los eventos
  export const getEventos = async (): Promise<Evento[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(mockEventos);
      }, 500); // Simula un retardo de red
    });
  };
  
  // Función para obtener un evento por su ID
  export const getEventoById = async (id: number): Promise<Evento | undefined> => {
  console.log("eventoService.ts: Intentando buscar evento con ID:", id); // Añade este log
  return new Promise((resolve) => {
    setTimeout(() => {
      const foundEvent = mockEventos.find(evento => evento.id === id);
      console.log("eventoService.ts: Evento encontrado:", foundEvent); // Añade este log
      resolve(foundEvent);
    }, 300);
  });
};
  
  // Función para simular el registro de un usuario a un evento
  export const registerUserToEvent = async (eventId: number, userId: string): Promise<boolean> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const eventIndex = mockEventos.findIndex(e => e.id === eventId);
        if (eventIndex > -1) {
          const event = mockEventos[eventIndex];
          // Simula la adición del usuario
          if (!event.invitados) {
              event.invitados = [];
          }
          if (!event.invitados.includes(userId)) {
              event.invitados.push(userId);
              if (event.cantidadParticipantes !== undefined) {
                  event.cantidadParticipantes += 1;
              } else {
                  event.cantidadParticipantes = 1;
              }
              // console.log(`Usuario ${userId} registrado en evento ${eventId}`);
              resolve(true); // Éxito
          } else {
              reject(new Error('Ya estás registrado en este evento (MOCK)'));
          }
        } else {
          reject(new Error('Evento no encontrado (MOCK)'));
        }
      }, 600);
    });
  };
  
  // Función para simular la desinscripción de un usuario de un evento
  export const unregisterUserFromEvent = async (eventId: number, userId: string): Promise<boolean> => {
      return new Promise((resolve, reject) => {
          setTimeout(() => {
              const eventIndex = mockEventos.findIndex(e => e.id === eventId);
              if (eventIndex > -1) {
                  const event = mockEventos[eventIndex];
                  if (event.invitados) {
                      const initialLength = event.invitados.length;
                      event.invitados = event.invitados.filter(inv => inv !== userId);
                      if (event.invitados.length < initialLength) {
                          if (event.cantidadParticipantes !== undefined && event.cantidadParticipantes > 0) {
                              event.cantidadParticipantes -= 1;
                          }
                          // console.log(`Usuario ${userId} desregistrado del evento ${eventId}`);
                          resolve(true); // Éxito
                      } else {
                          reject(new Error('No estabas registrado en este evento (MOCK)'));
                      }
                  } else {
                      reject(new Error('No estabas registrado en este evento (MOCK)'));
                  }
              } else {
                  reject(new Error('Evento no encontrado (MOCK)'));
              }
          }, 600);
      });
  };
  
  // Función para obtener eventos en los que el usuario está registrado (para el perfil)
  export const getEventosByUserId = async (userId: string): Promise<Evento[]> => {
      return new Promise((resolve) => {
          setTimeout(() => {
              const userEventos = mockEventos.filter(evento => 
                  evento.invitados && evento.invitados.includes(userId)
              );
              resolve(userEventos);
          }, 400);
      });
  
  };
  export const createEvent = async (newEvent: Evento): Promise<Evento> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Generar un ID único simple para el mock
      const newId = Math.max(...mockEventos.map(e => e.id)) + 1;
      const eventToSave = { ...newEvent, id: newId };
      mockEventos.push(eventToSave);
      // console.log("Evento creado (MOCK):", eventToSave);
      resolve(eventToSave);
    }, 1000);
  });
};
  // Función para actualizar un evento existente (MOCK TEMPORAL)
export const updateEvent = async (updatedEvent: Evento): Promise<Evento> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const index = mockEventos.findIndex(e => e.id === updatedEvent.id);
      if (index !== -1) {
        // Actualizar el evento manteniendo la referencia para las inscripciones
        mockEventos[index] = { ...updatedEvent, invitados: mockEventos[index].invitados }; // Conservar invitados
        // console.log("Evento actualizado (MOCK):", mockEventos[index]);
        resolve(mockEventos[index]);
      } else {
        reject(new Error('Evento no encontrado para actualizar (MOCK)'));
      }
    }, 1000);
  });
};
export const generateEventsReportCsv = async (): Promise<string> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      let csvContent = "Evento,Tipo,Fecha,Participantes Registrados,Invitados Externos,Empresa Patrocinadora,Descripción\n";

      mockEventos.forEach(event => {
        // Obtener nombres de usuarios registrados
        // Buscar el usuario por username (ya que 'invitados' contiene usernames)
        const registeredParticipants = event.invitados
          ?.map(usernameId => { // Cambiado 'userId' a 'usernameId' para mayor claridad
            const user = mockUsers.find(u => u.username === usernameId);
            return user ? user.username : `ID:${usernameId} (Desconocido)`;
          })
          .join('; ') || 'N/A';

        // Formatear invitados externos
        const externalGuests = event.invitadosExternos?.join('; ') || 'N/A';

        // Escapar comas y nuevas líneas en la descripción si existen
        const escapedDescription = event.descripcion ? `"${event.descripcion.replace(/"/g, '""')}"` : '';

        const row = [
          `"${event.nombre.replace(/"/g, '""')}"`,
          event.tipo,
          event.fecha,
          `"${registeredParticipants}"`,
          `"${externalGuests}"`,
          event.empresaPatrocinadora || 'N/A',
          escapedDescription
        ].join(',');

        csvContent += row + '\n';
      });

      console.log("CSV Report Generated:\n", csvContent);
      resolve(csvContent);
    }, 1500);
  });
};
  