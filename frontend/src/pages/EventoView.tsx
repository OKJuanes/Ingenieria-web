// src/pages/EventoView.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import { getEventoById, registerUserToEvent, unregisterUserFromEvent, Evento } from '../services/eventoService';
import { isAuthenticated, getUserData } from '../services/authService';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import '../assets/styles/EventoView.css';

// Extiende la definición de tipo de jsPDF para incluir autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: typeof autoTable;
  }
}

const EventoView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [evento, setEvento] = useState<Evento | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isRegistered, setIsRegistered] = useState<boolean>(false);
  
  const currentUser = getUserData();
  // currentUserId es el ID del usuario logueado. Si tu backend usa usernames en 'invitados', cambia a currentUser.username
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
          // *** ESTA LÍNEA ES CLAVE ***
          // Asume que fetchedEvento.invitados contiene los IDs de los usuarios registrados (strings o numbers).
          // Si tu backend devuelve usernames en invitados, entonces usa fetchedEvento.invitados?.includes(currentUser.username)
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
          navigate('/login'); // Redirigir si el token es inválido/expirado
        }
      } finally {
        setLoading(false);
      }
    };

    fetchEvento();
  }, [id, currentUsername, navigate]); // Dependencias para re-ejecutar el efecto

  const handleRegisterClick = async () => {
    if (!isAuthenticated()) {
      alert('Necesitas iniciar sesión para registrarte en un evento.');
      navigate('/login');
      return;
    }
    if (!evento?.id) {
      alert('No se pudo identificar el evento.');
      return;
    }
    try {
      await registerUserToEvent(evento.id);
      alert('¡Te has registrado exitosamente!');
      setIsRegistered(true);
      setEvento(prevEvento => prevEvento ? { 
        ...prevEvento, 
        cantidadParticipantes: (prevEvento.cantidadParticipantes || 0) + 1, 
        participantes: [...(prevEvento.participantes || []), currentUsername]
      } : null);

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
    if (!evento?.id) {
      alert('No se pudo identificar el evento.');
      return;
    }
    try {
      await unregisterUserFromEvent(evento.id);
      alert('¡Te has desinscrito del evento!');
      setIsRegistered(false);
      setEvento(prevEvento => prevEvento ? { 
        ...prevEvento, 
        cantidadParticipantes: Math.max(0, (prevEvento.cantidadParticipantes || 0) - 1), 
        participantes: (prevEvento.participantes || []).filter(p => p !== currentUsername)
      } : null);

    } catch (err: any) {
      alert(`Error al desinscribirte: ${err.message}`);
    }
  };

  const generatePDF = () => {
    if (!evento) return;

    const doc = new jsPDF();

    // Título del documento
    doc.setFontSize(18);
    doc.text(`Detalles del Evento: ${evento.nombre}`, 10, 10);

    // Información general del evento
    doc.setFontSize(12);
    doc.text(`Nombre: ${evento.nombre}`, 10, 20);
    doc.text(`Tipo: ${evento.tipo}`, 10, 30);
    doc.text(`Fecha: ${evento.fecha}`, 10, 40);
    doc.text(`Empresa: ${evento.empresa}`, 10, 50);

    // Ajustar la descripción para que no se desborde
    const descripcionY = 60;
    const descripcionWidth = 190; // Ancho máximo del texto
    const descripcionLines = doc.splitTextToSize(`Descripción: ${evento.descripcion}`, descripcionWidth);
    doc.text(descripcionLines, 10, descripcionY);

    // Participantes
    if (evento.participantes && evento.participantes.length > 0) {
      const startY = descripcionY + descripcionLines.length * 6 + 10;
      doc.text('Participantes:', 10, startY);

      const participantesData = evento.participantes.map((username, index) => [
        index + 1,
        username
      ]);

      // Usa la función importada directamente, pasando doc como primer argumento
      autoTable(doc, {
        head: [['#', 'Usuario']],
        body: participantesData,
        startY: startY + 5,
        styles: { fontSize: 10 },
        headStyles: { fillColor: [41, 128, 185] },
      });
    }

    // Guardar el PDF
    doc.save(`Evento_${evento.nombre}.pdf`);
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
                <i className="fas fa-user-tie mr-2 text-indigo-600"></i>Invitados Especiales:
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
                <i className="fas fa-user-check mr-2 text-indigo-600"></i>Usuarios Registrados:
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
                  className="evento-btn evento-btn-delete mr-2"
                >
                  Desinscribirme del Evento
                </button>
              ) : (
                <button
                  onClick={handleRegisterClick}
                  className="evento-btn evento-btn-register mr-2"
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
              className="evento-btn evento-btn-secondary mt-4"
            >
              Volver a Eventos
            </button>
            <button
              onClick={generatePDF}
              className="evento-btn evento-btn-secondary mr-2"
            >
              Descargar PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventoView;