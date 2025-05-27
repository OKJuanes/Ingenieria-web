// src/pages/Eventos.tsx (ajustado para Opción 1)
import React, { useEffect, useState, useCallback } from 'react';
import Navbar from '../components/common/Navbar';
import EventoCard from '../components/eventos/EventoCard';
import { getEventos, registerUserToEvent, unregisterUserFromEvent, Evento } from '../services/eventoService';
import { getUserData, isAuthenticated } from '../services/authService';
import { useNavigate } from 'react-router-dom';
import '../../assets/styles/HitoForm.css';

const Eventos: React.FC = () => {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [registeredEventIds, setRegisteredEventIds] = useState<Set<number>>(new Set());
  const navigate = useNavigate();
  const currentUser = getUserData();
  const userId = currentUser ? currentUser.username : ''; // Este userId es para la lógica del frontend (e.invitados.includes)

  const fetchEventos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedEventos = await getEventos();
      setEventos(fetchedEventos);

      if (isAuthenticated() && userId) {
        // Asumiendo que `e.invitados` contiene los `username`s de los usuarios registrados
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