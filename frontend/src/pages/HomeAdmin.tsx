// src/pages/HomeAdmin.tsx
import React, { useEffect, useState } from 'react';
import Navbar from '../components/common/Navbar';
import { getEventStats, getRecentEvents, Evento, generateEventsReportCsv  } from '../services/eventoService'; // Importa las nuevas funciones y la interfaz Evento
import { useNavigate } from 'react-router-dom'; // Para la navegación
import EventoCard from '../components/eventos/EventoCard'; // Para mostrar eventos recientes
import '../assets/styles/HomeAdmin.css'; // Tu archivo de estilos para HomeAdmin

const HomeAdmin: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    eventosActivos: 0,
    totalParticipantes: 0,
    proximoEvento: 'Cargando...',
  });
  const [recentEvents, setRecentEvents] = useState<Evento[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingRecent, setLoadingRecent] = useState(true);
  const [errorStats, setErrorStats] = useState<string | null>(null);
  const [errorRecent, setErrorRecent] = useState<string | null>(null);

  // Efecto para cargar las estadísticas
  useEffect(() => {
    const fetchStats = async () => {
      setLoadingStats(true);
      setErrorStats(null);
      try {
        const fetchedStats = await getEventStats();
        setStats(fetchedStats);
      } catch (err: any) {
        setErrorStats(err.message || 'Error al cargar las estadísticas.');
        console.error("Error fetching admin stats:", err);
      } finally {
        setLoadingStats(false);
      }
    };

    fetchStats();
  }, []);

  // Efecto para cargar los eventos recientes
  useEffect(() => {
    const fetchRecentEvents = async () => {
      setLoadingRecent(true);
      setErrorRecent(null);
      try {
        const fetchedEvents = await getRecentEvents(3); // Obtener los 3 eventos más recientes
        setRecentEvents(fetchedEvents);
      } catch (err: any) {
        setErrorRecent(err.message || 'Error al cargar los eventos recientes.');
        console.error("Error fetching recent events:", err);
      } finally {
        setLoadingRecent(false);
      }
    };

    fetchRecentEvents();
  }, []);

  // Manejadores de los botones de acción
  const handleCreateEvent = () => {
    navigate('/eventos/nuevo-evento'); // Redirige a la ruta para crear un nuevo evento
  };

  const handleGenerateReport = async () => {
    setLoadingRecent(true); // Activar el estado de carga
    try {
      const csvData = await generateEventsReportCsv(); // Llama a la función del servicio
      
      // Crear un Blob con el contenido CSV
      const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
      
      // Crear una URL para el Blob
      const url = URL.createObjectURL(blob);
      
      // Crear un elemento <a> temporal y simular un clic para descargar
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', 'reporte_eventos_y_participantes.csv'); // Nombre del archivo
      link.style.visibility = 'hidden'; // Ocultar el enlace
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link); // Limpiar el DOM
      URL.revokeObjectURL(url); // Liberar el objeto URL

      alert('Reporte generado exitosamente.');
    } catch (err: any) {
      alert(`Error al generar el reporte: ${err.message || 'Error desconocido'}`);
      console.error("Error generating report:", err);
    } finally {
      setLoadingRecent(false); // Desactivar el estado de carga
    }
  };
  const handleManageMilestones = () => {
    navigate('/admin/hitos'); // Redirige a la nueva página de gestión de hitos
  };
  return (
    <div className="home-admin-container">
      <Navbar />
      <div className="home-admin-content">
        <h2>Panel de Administración</h2>
        
        {loadingStats ? (
          <p className="text-white text-center">Cargando estadísticas...</p>
        ) : errorStats ? (
          <p className="text-red-300 text-center">Error al cargar estadísticas: {errorStats}</p>
        ) : (
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
        )}

        <div className="admin-actions">
          {/* Botón Crear Evento */}
          <button
            onClick={handleCreateEvent}
            className="btn btn-primary bg-violet-700 hover:bg-violet-800 text-white font-bold py-2 px-4 rounded transition duration-300"
          >
            <i className="fas fa-plus"></i> Crear Evento
          </button>
          
          {/* Botón Gestionar Hitos */}
          <button
            onClick={handleManageMilestones} // Llama a la nueva función de navegación
            className="btn btn-secondary bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded transition duration-300"
          >
            <i className="fas fa-trophy"></i> Gestionar Hitos
          </button>
          
          <button
            onClick={handleGenerateReport}
            className="btn btn-tertiary bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded transition duration-300"
          >
            <i className="fas fa-file-export"></i> Generar Reporte
          </button>
        </div>

        <div className="recent-events">
          <h3>📋 Eventos Recientes</h3>
          {loadingRecent ? (
            <p className="text-white text-center">Cargando eventos recientes...</p>
          ) : errorRecent ? (
            <p className="text-red-300 text-center">Error al cargar eventos: {errorRecent}</p>
          ) : recentEvents.length === 0 ? (
            <p className="text-white">No hay eventos recientes para mostrar.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentEvents.map((evento) => (
                <EventoCard
                  key={evento.id}
                  evento={evento}
                  isAdmin={true} // <-- ¡Pasa isAdmin a true para mostrar el botón de edición!
                  // No necesitas onRegisterClick/onUnregisterClick aquí a menos que quieras esa funcionalidad en el admin
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomeAdmin;