import React from 'react';
import '../assets/styles/HitoCard.css';

const HitoCard: React.FC<{ hito: any }> = ({ hito }) => {
  return (
    <div className="hito-card">
      <div className="hito-header">
        <h3>{hito.titulo}</h3>
        <span className={`badge ${hito.categoria === 'Estudiantes' ? 'badge-blue' : 'badge-green'}`}>
          {hito.categoria}
        </span>
      </div>
      <p className="hito-date">{hito.fecha}</p>
      <p className="hito-desc">{hito.descripcion}</p>
      <div className="hito-actions">
        <button className="btn-edit">Editar</button>
        <button className="btn-delete">Eliminar</button>
      </div>
    </div>
  );
};

export default HitoCard;