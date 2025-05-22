// src/pages/EventoView.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import { getEventoById, registerUserToEvent, unregisterUserFromEvent, Evento } from '../services/eventoService';
import { isAuthenticated, getUserData } from '../services/authService';
import '../assets/styles/EventoView.css'; // Asegúrate de tener este CSS

const EventoView: React.FC = () => {
  const { id } = useParams<{ id: string }>(); // Obtiene el ID de la URL
  const navigate = useNavigate();
  const [evento, setEvento] = useState<Evento | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isRegistered, setIsRegistered] = useState<boolean>(false);
  
  const currentUser = getUserData();
  const userId = currentUser ? currentUser.username : '';

  useEffect(() => {
    const fetchEvento = async () => {
      setLoading(true);
      setError(null);
      try {
        const eventoId = parseInt(id || '', 10);
        if (isNaN(eventoId)) {
          throw new Error('ID de evento no válido.');
        }
        const fetchedEvento = await getEventoById(eventoId);
        if (fetchedEvento) {
          setEvento(fetchedEvento);
          // Verificar si el usuario actual está registrado en este evento
          if (userId && fetchedEvento.invitados?.includes(userId)) {
              setIsRegistered(true);
          } else {
              setIsRegistered(false);
          }
        } else {
          setError('Evento no encontrado.');
        }
      } catch (err: any) {
        setError(err.message || 'Error al cargar el evento.');
        console.error("Error fetching single evento:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvento();
  }, [id, userId]); // Dependencias: id del evento y userId

  const handleRegisterClick = async () => {
    if (!isAuthenticated()) {
      alert('Necesitas iniciar sesión para registrarte en un evento.');
      navigate('/login');
      return;
    }
    if (!userId || !evento?.id) {
        alert('No se pudo identificar tu usuario o el evento.');
        return;
    }
    try {
      await registerUserToEvent(evento.id, userId);
      alert('¡Te has registrado exitosamente!');
      setIsRegistered(true);
      // Opcional: Actualizar el número de participantes localmente o volver a cargar
      setEvento(prevEvento => prevEvento ? { ...prevEvento, cantidadParticipantes: (prevEvento.cantidadParticipantes || 0) + 1, invitados: [...(prevEvento.invitados || []), userId] } : null);

    } catch (err: any) {
      alert(`Error al registrarte: ${err.message}`);
    }
  };

  const handleUnregisterClick = async () => {
    if (!isAuthenticated()) {
      alert('Necesitas iniciar sesión para desinscribirte de un evento.');
      navigate('/login');
      return;
    }
    if (!userId || !evento?.id) {
        alert('No se pudo identificar tu usuario o el evento.');
        return;
    }
    try {
      await unregisterUserFromEvent(evento.id, userId);
      alert('¡Te has desinscrito del evento!');
      setIsRegistered(false);
      // Opcional: Actualizar el número de participantes localmente o volver a cargar
      setEvento(prevEvento => prevEvento ? { ...prevEvento, cantidadParticipantes: Math.max(0, (prevEvento.cantidadParticipantes || 0) - 1), invitados: (prevEvento.invitados || []).filter(inv => inv !== userId) } : null);

    } catch (err: any) {
      alert(`Error al desinscribirte: ${err.message}`);
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-purple-400 to-indigo-600 flex items-center justify-center">
        <p className="text-white text-2xl">Cargando detalles del evento...</p>
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

  if (!evento) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-purple-400 to-indigo-600 flex items-center justify-center">
        <p className="text-white text-2xl">El evento solicitado no existe.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-400 to-indigo-600">
      <Navbar />
      <div className="container mx-auto p-4 flex flex-col items-center">
        <div className="evento-detail-card bg-white rounded-lg shadow-xl p-8 max-w-2xl w-full">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">{evento.nombre}</h2>
          <p className="text-gray-700 mb-2">
            <i className="fas fa-calendar-alt mr-2 text-indigo-600"></i>
            <span className="font-semibold">Fecha:</span> {evento.fecha}
          </p>
          <p className="text-gray-700 mb-2">
            <i className="fas fa-tag mr-2 text-indigo-600"></i>
            <span className="font-semibold">Tipo:</span> {evento.tipo}
          </p>
          <p className="text-gray-700 mb-4">
            <i className="fas fa-info-circle mr-2 text-indigo-600"></i>
            <span className="font-semibold">Descripción:</span> {evento.descripcion}
          </p>
          {evento.cantidadParticipantes !== undefined && (
            <p className="text-gray-700 mb-2">
              <i className="fas fa-users mr-2 text-indigo-600"></i>
              <span className="font-semibold">Participantes:</span> {evento.cantidadParticipantes}
            </p>
          )}
          {evento.empresaPatrocinadora && (
            <p className="text-gray-700 mb-2">
              <i className="fas fa-handshake mr-2 text-indigo-600"></i>
              <span className="font-semibold">Patrocinador:</span> {evento.empresaPatrocinadora}
            </p>
          )}

          {evento.invitadosExternos && evento.invitadosExternos.length > 0 && (
            <div className="mb-4">
              <p className="text-gray-700 font-semibold mb-1">
                <i className="fas fa-user-tie mr-2 text-indigo-600"></i>Invitados Especiales:
              </p>
              <ul className="list-disc list-inside text-gray-600">
                {evento.invitadosExternos.map((invitado, index) => (
                  <li key={index}>{invitado}</li>
                ))}
              </ul>
            </div>
          )}
          
          {evento.invitados && evento.invitados.length > 0 && (
            <div className="mb-4">
              <p className="text-gray-700 font-semibold mb-1">
                <i className="fas fa-user-check mr-2 text-indigo-600"></i>Usuarios Registrados:
              </p>
              <ul className="list-disc list-inside text-gray-600">
                {evento.invitados.map((invitado, index) => (
                  <li key={index}>{invitado}</li>
                ))}
              </ul>
            </div>
          )}


          <div className="mt-6 text-center">
            {isAuthenticated() && (
              isRegistered ? (
                <button
                  onClick={handleUnregisterClick}
                  
                >
                  Desinscribirme del Evento
                </button>
              ) : (
                <button
                  onClick={handleRegisterClick}
                  
                >
                  Registrarme en el Evento
                </button>
              )
            )}
            {!isAuthenticated() && (
                <p className="text-gray-700 text-sm mt-4">
                    <Link to="/login" className="text-indigo-600 hover:underline font-semibold">Inicia sesión</Link> para registrarte en este evento.
                </p>
            )}
            <button
              onClick={() => navigate('/eventos')}
              
            >
              Volver a Eventos
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventoView;