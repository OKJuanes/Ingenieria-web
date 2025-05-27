// src/components/eventos/MisEventos.tsx
import React from 'react';
import '../../assets/styles/MisEventos.css';
export const MisEventos: React.FC = () => {
  return (
    <div className="miseventos-container">
      <h2 className="miseventos-title">Mis Eventos</h2>
      <p className="miseventos-desc">Aquí puedes ver tus eventos.</p>
    </div>
  );
};

export default MisEventos;