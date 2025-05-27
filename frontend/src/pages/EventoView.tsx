// src/pages/EventoView.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import { getEventoById, registerUserToEvent, unregisterUserFromEvent, Evento } from '../services/eventoService';
import { isAuthenticated, getUserData } from '../services/authService';
import '../assets/styles/EventoView.css';
import '../assets/styles/global.css';

const EventoView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [evento, setEvento] = useState<Evento | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isRegistered, setIsRegistered] = useState<boolean>(false);

  const currentUser = getUserData();
  const currentUsername = currentUser ? currentUser.username : '';

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
          if (currentUsername && fetchedEvento.participantes?.includes(currentUsername)) {
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
        if (err.message.includes('No authentication token found')) {
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchEvento();
  }, [id, currentUsername, navigate]);

  const handleRegisterClick = async () => {
    if (!isAuthenticated()) {
      alert('Debes iniciar sesión para registrarte en un evento.');
      navigate('/login');
      return;
    }
    if (!evento?.id) {
      alert('No se pudo identificar el evento.');
      return;
    }
    try {
      await registerUserToEvent(evento.id);
      alert('¡Te has inscrito correctamente en el evento!');
      setIsRegistered(true);
      setEvento(prevEvento => prevEvento ? {
        ...prevEvento,
        cantidadParticipantes: (prevEvento.cantidadParticipantes || 0) + 1,
        participantes: [...(prevEvento.participantes || []), currentUsername]
      } : null);

    } catch (err: any) {
      alert(`No se pudo completar la inscripción: ${err.message}`);
    }
  };

  const handleUnregisterClick = async () => {
    if (!isAuthenticated()) {
      alert('Debes iniciar sesión para cancelar tu inscripción.');
      navigate('/login');
      return;
    }
    if (!evento?.id) {
      alert('No se pudo identificar el evento.');
      return;
    }
    try {
      await unregisterUserFromEvent(evento.id);
      alert('Has cancelado tu inscripción en el evento.');
      setIsRegistered(false);
      setEvento(prevEvento => prevEvento ? {
        ...prevEvento,
        cantidadParticipantes: Math.max(0, (prevEvento.cantidadParticipantes || 0) - 1),
        participantes: (prevEvento.participantes || []).filter(p => p !== currentUsername)
      } : null);

    } catch (err: any) {
      alert(`No se pudo cancelar la inscripción: ${err.message}`);
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
          {evento.empresa && (
            <p className="text-gray-700 mb-2">
              <i className="fas fa-handshake mr-2 text-indigo-600"></i>
              <span className="font-semibold">Patrocinador:</span> {evento.empresa}
            </p>
          )}

          {evento.invitadosExternos && evento.invitadosExternos.length > 0 && (
            <div className="mb-4">
              <p className="text-gray-700 font-semibold mb-1">
                <i className="fas fa-user-tie mr-2 text-indigo-600"></i>Invitados especiales:
              </p>
              <ul className="list-disc list-inside text-gray-600">
                {evento.invitadosExternos.map((invitado, index) => (
                  <li key={index}>{invitado}</li>
                ))}
              </ul>
            </div>
          )}

          {evento.participantes && evento.participantes.length > 0 && (
            <div className="mb-4">
              <p className="text-gray-700 font-semibold mb-1">
                <i className="fas fa-user-check mr-2 text-indigo-600"></i>Usuarios registrados:
              </p>
              <ul className="list-disc list-inside text-gray-600">
                {evento.participantes.map((username, index) => (
                  <li key={index}>{username}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-6 text-center">
            {isAuthenticated() && (
              isRegistered ? (
                <button
                  onClick={handleUnregisterClick}
                  className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded transition duration-300 mr-2"
                >
                  Cancelar inscripción
                </button>
              ) : (
                <button
                  onClick={handleRegisterClick}
                  className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded transition duration-300 mr-2"
                >
                  Inscribirme en el evento
                </button>
              )
            )}
            {!isAuthenticated() && (
              <p className="text-gray-700 text-sm mt-4">
                <Link to="/login" className="text-indigo-600 hover:underline font-semibold">Inicia sesión</Link> para inscribirte en este evento.
              </p>
            )}
            <button
              onClick={() => navigate('/eventos')}
              className="mt-4 bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded transition duration-300"
            >
              Volver a eventos
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventoView;