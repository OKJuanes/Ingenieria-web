// src/pages/Eventos.tsx (ajustado para Opción 1)
import React, { useEffect, useState, useCallback } from 'react';
import Navbar from '../components/common/Navbar';
import EventoCard from '../components/eventos/EventoCard';
import '../assets/styles/global.css';
import { getEventos, registerUserToEvent, unregisterUserFromEvent, Evento } from '../services/eventoService';
import { getUserData, isAuthenticated } from '../services/authService';
import { useNavigate } from 'react-router-dom';

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
  }, [userId]);

  useEffect(() => {
    fetchEventos();
  }, [fetchEventos]);

  const handleRegisterClick = async (eventId: number) => {
    if (!isAuthenticated()) {
      alert('Debes iniciar sesión para inscribirte en un evento.');
      navigate('/login');
      return;
    }
    try {
      await registerUserToEvent(eventId); 
      alert('¡Te has inscrito correctamente en el evento!');
      setRegisteredEventIds(prev => new Set(prev).add(eventId));
      fetchEventos(); 
    } catch (err: any) {
      alert(`No se pudo inscribir en el evento: ${err.message}`);
    }
  };

  const handleUnregisterClick = async (eventId: number) => {
    if (!isAuthenticated()) {
      alert('Debes iniciar sesión para cancelar tu inscripción.');
      navigate('/login');
      return;
    }
    try {
      await unregisterUserFromEvent(eventId);
      alert('Has cancelado tu inscripción en el evento.');
      setRegisteredEventIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(eventId);
        return newSet;
      });
      fetchEventos();
    } catch (err: any) {
      alert(`No se pudo cancelar la inscripción: ${err.message}`);
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