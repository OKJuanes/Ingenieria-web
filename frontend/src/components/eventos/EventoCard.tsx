// src/components/eventos/EventoCard.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Evento } from '../../services/eventoService'; // Importa la interfaz Evento
import '../../assets/styles/EventoCard.css'; // Asegúrate de tener este CSS

interface EventoCardProps {
  evento: Evento;
  onRegisterClick?: (eventId: number) => void; // Opcional: para el botón de registro
  onUnregisterClick?: (eventId: number) => void; // Opcional: para el botón de desinscripción
  isRegistered?: boolean; // Opcional: para saber si el usuario ya está registrado
}

const EventoCard: React.FC<EventoCardProps> = ({ evento, onRegisterClick, onUnregisterClick, isRegistered }) => {
  return (
    <div className="evento-card bg-white rounded-lg shadow-md p-4 flex flex-col justify-between">
      <div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">{evento.nombre}</h3>
        <p className="text-gray-600 mb-1">
          <i className="fas fa-calendar-alt mr-2"></i>Fecha: {evento.fecha}
        </p>
        <p className="text-gray-600 mb-1">
          <i className="fas fa-tag mr-2"></i>Tipo: {evento.tipo}
        </p>
        {evento.descripcion && (
          <p className="text-gray-700 text-sm mb-2">{evento.descripcion.substring(0, 100)}...</p>
        )}
        {evento.cantidadParticipantes !== undefined && (
            <p className="text-gray-600 text-sm mb-1">
                <i className="fas fa-users mr-2"></i>Participantes: {evento.cantidadParticipantes}
            </p>
        )}
      </div>
      <div className="mt-4 flex flex-wrap justify-between items-center gap-2">
        <Link 
          to={`/eventos/${evento.id}`} 
          className="btn-ver-detalles bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded transition duration-300"
        >
          Ver Detalles
        </Link>
        {onRegisterClick && !isRegistered && (
          <button
            onClick={() => onRegisterClick(evento.id)}
            className="btn-registrar bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition duration-300"
          >
            Registrarse
          </button>
        )}
        {onUnregisterClick && isRegistered && (
          <button
            onClick={() => onUnregisterClick(evento.id)}
            className="btn-desregistrar bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition duration-300"
          >
            Desinscribirse
          </button>
        )}
      </div>
    </div>
  );
};

export default EventoCard;