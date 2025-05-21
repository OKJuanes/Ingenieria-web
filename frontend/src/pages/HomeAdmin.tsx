import React from 'react';
import Navbar from '../components/common/Navbar';
import '../assets/styles/HomeAdmin.css';

const HomeAdmin: React.FC = () => {
  // Datos de ejemplo
  const stats = {
    eventosActivos: 15,
    totalParticipantes: 450,
    proximoEvento: 'Conferencia de IA - 25/10/2023'
  };

  return (
    <div className="home-admin-container">
      <Navbar />
      <div className="home-admin-content">
        <h2>Panel de Administración</h2>
        
        <div className="stats-grid">
          <div className="stat-card">
            <h3>📅 Eventos Activos</h3>
            <p>{stats.eventosActivos}</p>
          </div>
          <div className="stat-card">
            <h3>👥 Total Participantes</h3>
            <p>{stats.totalParticipantes}</p>
          </div>
          <div className="stat-card">
            <h3>🔜 Próximo Evento</h3>
            <p>{stats.proximoEvento}</p>
          </div>
        </div>

        <div className="admin-actions">
          <button className="btn btn-primary">
            <i className="fas fa-plus"></i> Crear Evento
          </button>
          <button className="btn btn-secondary">
            <i className="fas fa-trophy"></i> Gestionar Hitos
          </button>
          <button className="btn btn-tertiary">
            <i className="fas fa-file-export"></i> Generar Reporte
          </button>
        </div>

        <div className="recent-events">
          <h3>📋 Eventos Recientes</h3>
          {/* Aquí iría un componente EventoList */}
        </div>
      </div>
    </div>
  );
};

export default HomeAdmin;