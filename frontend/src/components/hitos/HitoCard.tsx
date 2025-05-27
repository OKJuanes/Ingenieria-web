import React from 'react';
import '../assets/styles/HitoCard.css';

const HitoCard: React.FC<{ hito: any; onEdit?: () => void; onDelete?: () => void }> = ({ hito, onEdit, onDelete }) => {
  return (
    <div className="hito-card">
      <div className="hito-header">
        <h3 className="hito-title">{hito.titulo}</h3>
        <span className={`badge ${hito.categoria === 'Estudiantes' ? 'badge-blue' : 'badge-green'}`}>
          {hito.categoria}
        </span>
      </div>
      <p className="hito-date">{hito.fecha}</p>
      <p className="hito-desc">{hito.descripcion}</p>
      <div className="hito-actions">
        <button className="hito-btn hito-btn-edit" onClick={onEdit}>Editar</button>
        <button className="hito-btn hito-btn-delete" onClick={onDelete}>Eliminar</button>
      </div>
    </div>
  );
};

export default HitoCard;