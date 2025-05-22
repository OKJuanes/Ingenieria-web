// src/pages/Profile.tsx
import React, { useEffect, useState, useCallback } from 'react';
import Navbar from '../components/common/Navbar';
import EventoCard from '../components/eventos/EventoCard'; // Reutilizamos EventoCard
import { getUserData, isAuthenticated } from '../services/authService';
import { getEventosByUserId, Evento, unregisterUserFromEvent } from '../services/eventoService';
import { useNavigate, Navigate } from 'react-router-dom'; // Importa Navigate

import '../assets/styles/Profile.css'; // Asegúrate de tener este CSS

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const userData = getUserData(); // Obtener los datos del usuario del localStorage
  
  const [userEventos, setUserEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // === REDIRECCIÓN TEMPRANA SI NO ESTÁ AUTENTICADO ===
  // Esto asegura que la página no se renderice si el usuario no está logueado.
  // ProtectedRoute ya debería manejar esto, pero esta es una capa adicional.
  if (!isAuthenticated()) {
    // console.log("Usuario no autenticado en Profile. Redirigiendo a /login.");
    return <Navigate to="/login" replace />;
  }

  // Si llegamos a este punto, el usuario está autenticado.
  // Ahora podemos asumir que userData debería existir.
  // Si userData es null o no tiene username aquí, hay un problema en authService.ts.
  const userId = userData?.username; // Usamos el username como ID del usuario mock

  // Efecto para obtener los eventos a los que el usuario está registrado
  const fetchUserEventos = useCallback(async () => {
    // Si userId no existe (por ejemplo, si userData es null o no tiene username),
    // no podemos buscar eventos. Mostrar un error o mensaje.
    if (!userId) {
      // console.error("Profile Component: userId es nulo. No se cargarán eventos del usuario.");
      setLoading(false); // Detener el estado de carga
      setError('No se pudo obtener la información de tu usuario para cargar los eventos.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // console.log(`Profile Component: Cargando eventos para el usuario: ${userId}`);
      const eventos = await getEventosByUserId(userId);
      setUserEventos(eventos);
    } catch (err: any) {
      setError(err.message || 'Error al cargar tus eventos registrados.');
      console.error("Profile Component - Error al cargar eventos del usuario:", err);
    } finally {
      setLoading(false);
    }
  }, [userId]); // Este useCallback depende de userId

  // useEffect para llamar a fetchUserEventos cuando el componente se monta
  // o cuando userId cambia (aunque userId no debería cambiar si el usuario está logueado)
  useEffect(() => {
    fetchUserEventos(); // Llama a la función asíncrona
  }, [fetchUserEventos]); // Dependencia del useCallback para que solo se ejecute cuando cambie

  // Función para manejar la desinscripción de un evento
  const handleUnregisterClick = async (eventId: number) => {
    if (!userId) {
        alert('Error: No se pudo identificar tu usuario para la desinscripción.');
        return;
    }
    try {
      // console.log(`Profile Component: Desregistrando a ${userId} del evento ${eventId}`);
      await unregisterUserFromEvent(eventId, userId);
      alert('¡Te has desinscrito del evento exitosamente!');
      // Después de la desinscripción, volvemos a cargar la lista de eventos del usuario
      fetchUserEventos();
    } catch (err: any) {
      alert(`Error al desinscribirte: ${err.message}`);
      console.error("Profile Component - Error al desinscribirse:", err);
    }
  };

  // === Renderizado condicional de estados de la UI ===
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

  // Este caso debería ser manejado por la redirección inicial `if (!isAuthenticated())`,
  // pero lo mantenemos como un fallback de seguridad si `userData` es nulo a pesar de `isAuthenticated()`
  if (!userData) {
    return (
        <div className="min-h-screen bg-gradient-to-r from-purple-400 to-indigo-600 flex flex-col items-center justify-center">
            <p className="text-red-300 text-2xl mb-4">Error: No se pudo cargar la información de tu perfil.</p>
            <button
                onClick={() => {
                    // Limpiar datos por si acaso y redirigir a login para un reintento
                    // console.log("Profile Component: userData nulo inesperado. Limpiando y redirigiendo a login.");
                    localStorage.clear(); // Limpia todo el localStorage si hay datos corruptos
                    navigate('/login');
                }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded transition duration-300"
            >
                Reintentar Inicio de Sesión
            </button>
        </div>
    );
  }

  // === Renderizado principal del perfil ===
  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-400 to-indigo-600">
      <Navbar />
      <div className="container mx-auto p-4">
        <h2 className="text-4xl font-bold text-white mb-6">Mi Perfil</h2>
        
        {/* Información del Usuario */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h3 className="text-2xl font-semibold text-gray-800 mb-4">Información del Usuario</h3>
          <p className="text-gray-700 mb-2"><span className="font-bold">Usuario:</span> {userData.username}</p>
          <p className="text-gray-700"><span className="font-bold">Rol:</span> {userData.role === 'admin' ? 'Administrador' : 'Usuario Regular'}</p>
          {/* Aquí podrías añadir más información del usuario si tu mockUsers o backend la proveyera */}
          {/* Por ejemplo, desde tu mockUsers, podrías añadir email, nombre, apellido: */}
          {/* <p className="text-gray-700 mb-2"><span className="font-bold">Correo:</span> {userData.email}</p> */}
          {/* <p className="text-gray-700 mb-2"><span className="font-bold">Nombre Completo:</span> {userData.nombre} {userData.apellido}</p> */}
        </div>

        {/* Mis Eventos Registrados */}
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
                isRegistered={true} // Siempre es true aquí ya que son eventos en los que el usuario está registrado
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;