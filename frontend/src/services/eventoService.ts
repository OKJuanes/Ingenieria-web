// src/services/eventoService.ts

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
      invitados: ['Usuario A', 'Usuario B'], // Estos podrían ser IDs o nombres de usuarios internos
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
      invitados: [],
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
      invitados: [],
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
      invitados: [],
    },
  ];
  
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
    return new Promise((resolve) => {
      setTimeout(() => {
        const evento = mockEventos.find(e => e.id === id);
        resolve(evento);
      }, 300); // Simula un retardo de red más corto
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