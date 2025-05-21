// src/pages/Profile.tsx
import React, { useEffect, useState, useCallback } from 'react';
import Navbar from '../components/common/Navbar';
import EventoCard from '../components/eventos/EventoCard'; // Reutilizamos EventoCard
import { getUserData, isAuthenticated } from '../services/authService';
import { getEventosByUserId, Evento, unregisterUserFromEvent } from '../services/eventoService';
import { useNavigate } from 'react-router-dom';
import '../assets/styles/Profile.css'; // Asegúrate de tener este CSS

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const userData = getUserData();
  const [userEventos, setUserEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Redirigir si no está autenticado
  useEffect(() => {
    if (!isAuthenticated()) {
      alert('Necesitas iniciar sesión para ver tu perfil.');
      navigate('/login');
    }
  }, [navigate]);

  const fetchUserEventos = useCallback(async () => {
    if (!userData?.username) return; // Si no hay usuario logueado, no hacer nada

    setLoading(true);
    setError(null);
    try {
      const eventos = await getEventosByUserId(userData.username);
      setUserEventos(eventos);
    } catch (err: any) {
      setError(err.message || 'Error al cargar tus eventos.');
      console.error("Error fetching user eventos:", err);
    } finally {
      setLoading(false);
    }
  }, [userData]); // Dependencia del userData

  useEffect(() => {
    fetchUserEventos();
  }, [fetchUserEventos]);

  const handleUnregisterClick = async (eventId: number) => {
    if (!userData?.username) {
        alert('No se pudo identificar tu usuario para la desinscripción.');
        return;
    }
    try {
      await unregisterUserFromEvent(eventId, userData.username);
      alert('¡Te has desinscrito del evento!');
      // Actualizar la lista de eventos del usuario
      fetchUserEventos();
    } catch (err: any) {
      alert(`Error al desinscribirte: ${err.message}`);
    }
  };

  if (!isAuthenticated()) {
    return null; // O puedes mostrar un mensaje de "redireccionando"
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-purple-400 to-indigo-600 flex items-center justify-center">
        <p className="text-white text-2xl">Cargando perfil...</p>
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
        <h2 className="text-4xl font-bold text-white mb-6">Mi Perfil</h2>
        
        {userData && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h3 className="text-2xl font-semibold text-gray-800 mb-4">Información del Usuario</h3>
            <p className="text-gray-700 mb-2"><span className="font-bold">Usuario:</span> {userData.username}</p>
            <p className="text-gray-700"><span className="font-bold">Rol:</span> {userData.role === 'admin' ? 'Administrador' : 'Usuario Regular'}</p>
            {/* Aquí podrías añadir más información del usuario si tu mockUsers en authService.ts o tu backend la proveyera */}
            {/* Ejemplo: <p className="text-gray-700"><span className="font-bold">Correo:</span> {userData.email}</p> */}
          </div>
        )}

        <h3 className="text-3xl font-bold text-white mb-6">Mis Eventos Registrados</h3>
        {userEventos.length === 0 ? (
          <p className="text-white text-lg">Aún no te has registrado en ningún evento.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userEventos.map((evento) => (
              <EventoCard 
                key={evento.id} 
                evento={evento} 
                onUnregisterClick={handleUnregisterClick}
                isRegistered={true} // Siempre es true aquí porque son eventos registrados
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;