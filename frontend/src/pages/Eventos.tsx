// src/pages/Eventos.tsx
import React from 'react';
import Navbar from '../components/common/Navbar';
import EventoCard from '../components/eventos/EventoCard';

const Eventos: React.FC = () => {
  const eventos = [
    { id: 1, nombre: 'Hackathon 2023', fecha: '2023-10-15', tipo: 'Hackathon' },
    { id: 2, nombre: 'Conferencia de IA', fecha: '2023-11-20', tipo: 'Conferencia' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-400 to-indigo-600">
      <Navbar />
      <div className="container mx-auto p-4">
        <h2 className="text-4xl font-bold text-white mb-4">Eventos</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {eventos.map((evento) => (
            <EventoCard key={evento.id} evento={evento} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Eventos;