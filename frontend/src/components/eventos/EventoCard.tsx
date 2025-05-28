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
    <div className="evento-card">
      <div>
        <h3 className="evento-card-title">{evento.nombre}</h3>
        <p className="evento-card-info">
          <i className="fas fa-calendar-alt mr-2"></i>Fecha: <span>{evento.fecha}</span>
        </p>
        <p className="evento-card-info">
          <i className="fas fa-tag mr-2"></i>Tipo: <span>{evento.tipo}</span>
        </p>
        {evento.descripcion && (
          <p className="evento-card-desc">{evento.descripcion.substring(0, 100)}...</p>
        )}
      </div>
      <div className="evento-card-actions">
        <Link to={`/eventos/${evento.id}`} className="evento-btn">
          Ver Detalles
        </Link>
        {onRegisterClick && !isRegistered && (
          <button onClick={() => onRegisterClick(evento.id)} className="evento-btn evento-btn-register">
            Registrarse
          </button>
        )}
        {onUnregisterClick && isRegistered && (
          <button onClick={() => onUnregisterClick(evento.id)} className="evento-btn evento-btn-secondary">
            Desinscribirse
          </button>
        )}
        {isAdmin && (
          <Link to={`/editar-evento/${evento.id}`} className="evento-btn evento-btn-edit">
            Editar
          </Link>
        )}
      </div>
    </div>
  );
};

export default EventoCard;