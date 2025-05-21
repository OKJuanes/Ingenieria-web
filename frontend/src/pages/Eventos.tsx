// src/pages/Eventos.tsx
import React, { useEffect, useState, useCallback } from 'react';
import Navbar from '../components/common/Navbar';
import EventoCard from '../components/eventos/EventoCard';
import { getEventos, registerUserToEvent, unregisterUserFromEvent, Evento } from '../services/eventoService';
import { getUserData, isAuthenticated } from '../services/authService'; // Para obtener el ID del usuario logueado
import { useNavigate } from 'react-router-dom';

const Eventos: React.FC = () => {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [registeredEventIds, setRegisteredEventIds] = useState<Set<number>>(new Set()); // Para saber a qué eventos está registrado el usuario
  const navigate = useNavigate();
  const currentUser = getUserData(); // Obtener los datos del usuario actual
  const userId = currentUser ? currentUser.username : ''; // Usar el username como ID del usuario mock

  // Función para cargar los eventos
  const fetchEventos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedEventos = await getEventos();
      setEventos(fetchedEventos);

      // Si el usuario está logueado, determinar a qué eventos está registrado
      if (isAuthenticated() && userId) {
        const registered = fetchedEventos
          .filter(e => e.invitados?.includes(userId))
          .map(e => e.id);
        setRegisteredEventIds(new Set(registered));
      }
    } catch (err: any) {
      setError(err.message || 'Error al cargar los eventos.');
      console.error("Error fetching eventos:", err);
    } finally {
      setLoading(false);
    }
  }, [userId]); // Dependencia del userId

  useEffect(() => {
    fetchEventos(); // Cargar eventos al montar el componente
  }, [fetchEventos]); // Ejecutar cuando fetchEventos cambie (primera carga)

  const handleRegisterClick = async (eventId: number) => {
    if (!isAuthenticated()) {
      alert('Necesitas iniciar sesión para registrarte en un evento.');
      navigate('/login');
      return;
    }
    if (!userId) {
        alert('No se pudo identificar tu usuario para el registro.');
        return;
    }
    try {
      await registerUserToEvent(eventId, userId);
      alert('¡Te has registrado exitosamente!');
      // Actualizar el estado para reflejar el registro
      setRegisteredEventIds(prev => new Set(prev).add(eventId));
      // Opcional: Vuelve a cargar todos los eventos para actualizar la cantidad de participantes si es necesario
      fetchEventos(); 
    } catch (err: any) {
      alert(`Error al registrarte: ${err.message}`);
    }
  };

  const handleUnregisterClick = async (eventId: number) => {
    if (!isAuthenticated()) {
      alert('Necesitas iniciar sesión para desinscribirte de un evento.');
      navigate('/login');
      return;
    }
    if (!userId) {
        alert('No se pudo identificar tu usuario para la desinscripción.');
        return;
    }
    try {
      await unregisterUserFromEvent(eventId, userId);
      alert('¡Te has desinscrito del evento!');
      // Actualizar el estado para reflejar la desinscripción
      setRegisteredEventIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(eventId);
          return newSet;
      });
      // Opcional: Vuelve a cargar todos los eventos
      fetchEventos();
    } catch (err: any) {
      alert(`Error al desinscribirte: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-purple-400 to-indigo-600 flex items-center justify-center">
        <p className="text-white text-2xl">Cargando eventos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-purple-400 to-indigo-600 flex items-center justify-center">
        <p className="text-red-300 text-2xl">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-400 to-indigo-600">
      <Navbar />
      <div className="container mx-auto p-4">
        <h2 className="text-4xl font-bold text-white mb-6">Eventos Disponibles</h2>
        {eventos.length === 0 ? (
          <p className="text-white text-lg">No hay eventos disponibles en este momento.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {eventos.map((evento) => (
              <EventoCard 
                key={evento.id} 
                evento={evento} 
                onRegisterClick={handleRegisterClick}
                onUnregisterClick={handleUnregisterClick}
                isRegistered={registeredEventIds.has(evento.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Eventos;