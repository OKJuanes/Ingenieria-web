// src/components/eventos/EventoCard.tsx
import React from 'react';

interface EventoCardProps {
  evento: {
    id: number;
    nombre: string;
    fecha: string;
    tipo: string;
  };
}

const EventoCard: React.FC<EventoCardProps> = ({ evento }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h3 className="text-xl font-bold text-purple-800 mb-2">{evento.nombre}</h3>
      <p className="text-gray-700">Fecha: {evento.fecha}</p>
      <p className="text-gray-700">Tipo: {evento.tipo}</p>
    </div>
  );
};

export default EventoCard;