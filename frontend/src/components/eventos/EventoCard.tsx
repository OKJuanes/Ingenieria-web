// src/components/eventos/EventoCard.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Evento } from '../../services/eventoService';
import '../../assets/styles/EventoCard.css';

interface EventoCardProps {
  evento: Evento;
  onRegisterClick?: (eventId: number) => void;
  onUnregisterClick?: (eventId: number) => void;
  isRegistered?: boolean;
  isAdmin?: boolean; // <-- ¡NUEVO PROP!
}

const EventoCard: React.FC<EventoCardProps> = ({ evento, onRegisterClick, onUnregisterClick, isRegistered, isAdmin }) => {
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
      </div>
      <div className="mt-4 flex flex-wrap justify-between items-center gap-2">
        <Link
          to={`/eventos/${evento.id}`}
          
        >
          Ver Detalles
        </Link>

        {/* Botón de REGISTRARSE */}
        {onRegisterClick && !isRegistered && (
          <button
            onClick={() => onRegisterClick(evento.id)}
            
          >
            Registrarse
          </button>
        )}

        {/* Botón de DESINSCRIBIRSE */}
        {onUnregisterClick && isRegistered && (
          <button
            onClick={() => onUnregisterClick(evento.id)}
            
          >
            Desinscribirse
          </button>
        )}

        {/* Botón de EDITAR (visible solo para administradores) */}
        {isAdmin && (
          <Link
            to={`/editar-evento/${evento.id}`} // Enlace a la nueva ruta de edición
            
          >
            Editar
          </Link>
        )}
      </div>
    </div>
  );
};

export default EventoCard;