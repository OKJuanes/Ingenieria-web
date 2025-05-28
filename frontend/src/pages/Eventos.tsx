// src/pages/Eventos.tsx (ajustado para Opción 1)
import React, { useEffect, useState, useCallback } from 'react';
import Navbar from '../components/common/Navbar';
import EventoCard from '../components/eventos/EventoCard';
import { getEventos, registerUserToEvent, unregisterUserFromEvent, Evento, getRegisteredEventsForCurrentUser } from '../services/eventoService';
import { getUserData, isAuthenticated } from '../services/authService';
import { useNavigate } from 'react-router-dom';
import "../assets/styles/Eventos.css"; // Asegúrate de importar el CSS de eventos
import Spinner from '../components/common/Spinner';

const Eventos: React.FC = () => {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [registeredEventIds, setRegisteredEventIds] = useState<Set<number>>(new Set());
  const navigate = useNavigate();
  const currentUser = getUserData();
  const userId = currentUser ? currentUser.username : '';

  const fetchEventos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedEventos = await getEventos();
      setEventos(fetchedEventos);

      if (isAuthenticated() && userId) {
        // Obtener eventos donde el usuario está registrado
        const misEventos = await getRegisteredEventsForCurrentUser();
        
        // Convertir a un Set de IDs para búsquedas rápidas
        const registeredIds = new Set(misEventos.map(e => e.id));
        setRegisteredEventIds(registeredIds);
      }
    } catch (err: any) {
      setError(err.message || 'Error al cargar los eventos.');
      console.error("Error fetching eventos:", err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchEventos();
  }, [fetchEventos]);

  const handleRegisterClick = async (eventId: number) => {
    if (!isAuthenticated()) {
      alert('Necesitas iniciar sesión para registrarte en un evento.');
      navigate('/login');
      return;
    }
    // No es necesario verificar userId aquí si el backend lo obtiene del token
    try {
      // Llama sin userId si el backend lo infiere del token
      await registerUserToEvent(eventId); 
      alert('¡Te has registrado exitosamente!');
      setRegisteredEventIds(prev => new Set(prev).add(eventId));
      // Recargar para obtener la lista actualizada de participantes
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
    // No es necesario verificar userId aquí si el backend lo obtiene del token
    try {
      // Llama sin userId si el backend lo infiere del token
      await unregisterUserFromEvent(eventId);
      alert('¡Te has desinscrito del evento!');
      setRegisteredEventIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(eventId);
          return newSet;
      });
      // Recargar para obtener la lista actualizada de participantes
      fetchEventos();
    } catch (err: any) {
      alert(`Error al desinscribirte: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-purple-400 to-indigo-600 flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-purple-400 to-indigo-600 flex items-center justify-center fade-in">
        <p className="text-red-300 text-2xl">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-400 to-indigo-600 eventos-main-container">
      <Navbar />
      <div className="container mx-auto p-4 fade-in">
        <h2 className="text-4xl font-bold text-white mb-6">Eventos Disponibles</h2>
        {eventos.length === 0 ? (
          <p className="text-white text-lg">No hay eventos disponibles en este momento.</p>
        ) : (
          <div className="eventos-grid">
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