// src/pages/HomeAdmin.tsx
import React, { useEffect, useState } from 'react';
import Navbar from '../components/common/Navbar';
import { getEventStats, getRecentEvents, Evento, generateEventsReportCsv, getEventos } from '../services/eventoService'; // Importa las nuevas funciones y la interfaz Evento
import { Link, useNavigate } from 'react-router-dom'; // Para la navegación
import EventoCard from '../components/eventos/EventoCard'; // Para mostrar eventos recientes
import '../assets/styles/HomeAdmin.css'; // Tu archivo de estilos para HomeAdmin
import 'bootstrap/dist/css/bootstrap.min.css';

const HomeAdmin: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    eventosActivos: 0,
    totalParticipantes: 0,
    proximoEvento: 'Cargando...',
  });
  const [recentEvents, setRecentEvents] = useState<Evento[]>([]);
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingRecent, setLoadingRecent] = useState(true);
  const [loading, setLoading] = useState(true);
  const [errorStats, setErrorStats] = useState<string | null>(null);
  const [errorRecent, setErrorRecent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Efecto para cargar las estadísticas
  useEffect(() => {
    const fetchStats = async () => {
      setLoadingStats(true);
      setErrorStats(null);
      try {
        const fetchedStats = await getEventStats();
        console.log("Estadísticas cargadas:", fetchedStats);
        
        setStats({
          eventosActivos: fetchedStats.eventosActivos || 0,
          totalParticipantes: fetchedStats.totalParticipantes || 0,
          proximoEvento: fetchedStats.proximoEvento || 'Sin eventos próximos',
        });
      } catch (err: any) {
        console.error("Error al cargar estadísticas:", err);
        setErrorStats(err.message || 'Error al cargar las estadísticas.');
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

  // Efecto para cargar todos los eventos (para la tabla de gestión)
  useEffect(() => {
    const fetchEventos = async () => {
      try {
        setLoading(true);
        const fetchedEventos = await getEventos();
        console.log("Eventos cargados (admin):", fetchedEventos);
        setEventos(fetchedEventos);
      } catch (err: any) {
        console.error("Error al cargar eventos:", err);
        setError(err.message || 'Error al cargar los eventos.');
      } finally {
        setLoading(false);
      }
    };

    fetchEventos();
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
  // Reemplaza la sección de contenido principal
  return (
    <div className="home-admin-container">
      <Navbar />
      <div className="home-admin-content">
        <h2 className="panel-title">Panel de Administración</h2>
        
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">📅</div>
            <h3>Eventos Activos</h3>
            {loadingStats ? (
              <p className="stat-value loading">Cargando...</p>
            ) : errorStats ? (
              <p className="stat-value error">Error</p>
            ) : (
              <p className="stat-value">{stats.eventosActivos}</p>
            )}
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <h3>Total Participantes</h3>
            {loadingStats ? (
              <p className="stat-value loading">Cargando...</p>
            ) : errorStats ? (
              <p className="stat-value error">Error</p>
            ) : (
              <p className="stat-value">{stats.totalParticipantes}</p>
            )}
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">🔜</div>
            <h3>Próximo Evento</h3>
            {loadingStats ? (
              <p className="stat-value loading">Cargando...</p>
            ) : errorStats ? (
              <p className="stat-value error">Error</p>
            ) : (
              <p className="stat-value">{stats.proximoEvento}</p>
            )}
          </div>
        </div>

        <div className="action-buttons">
          <button 
            onClick={handleCreateEvent} 
            className="action-button create-button"
          >
            Crear Evento
          </button>
          <button 
            onClick={handleManageMilestones} 
            className="action-button manage-button"
          >
            Gestionar Hitos
          </button>
          <button 
            onClick={handleGenerateReport} 
            className="action-button report-button"
          >
            Generar Reporte
          </button>
        </div>

        <div className="recent-events-section">
          <h3 className="section-title">📋 Eventos Recientes</h3>
          {loadingRecent ? (
            <p className="loading-text">Cargando eventos recientes...</p>
          ) : errorRecent ? (
            <p className="error-text">Error al cargar eventos: {errorRecent}</p>
          ) : recentEvents.length === 0 ? (
            <p className="empty-text">No hay eventos recientes para mostrar.</p>
          ) : (
            <div className="events-grid">
              {recentEvents.map((evento) => (
                <EventoCard
                  key={evento.id}
                  evento={evento}
                  isAdmin={true}
                />
              ))}
            </div>
          )}
        </div>

        {/* Nueva sección: Tabla de gestión de eventos */}
        <div className="events-table-section">
          <h3 className="section-title">📋 Gestión de Eventos</h3>
          {loading ? (
            <p className="loading-text">Cargando eventos...</p>
          ) : error ? (
            <p className="error-text">Error al cargar eventos: {error}</p>
          ) : eventos.length === 0 ? (
            <p className="empty-text">No hay eventos para mostrar.</p>
          ) : (
            <div className="table-container">
              <table className="events-table">
                <thead>
                  <tr>
                    {/* <th>ID</th> */} {/* Elimina o comenta esta línea */}
                    <th>Nombre</th>
                    <th>Fecha</th>
                    <th>Tipo</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {eventos.map((evento) => (
                    <tr key={evento.id}>
                      {/* <td>{evento.id}</td> */} {/* Elimina o comenta esta línea */}
                      <td>{evento.nombre}</td>
                      <td>{evento.fecha}</td>
                      <td>{evento.tipo}</td>
                      <td>
                        {/* Aquí puedes mostrar el estado si lo tienes */}
                      </td>
                      <td className="actions-cell">
                        <Link 
                          to={`/eventos/${evento.id}`} 
                          className="event-action-btn view-btn"
                        >
                          Ver
                        </Link>
                        <Link 
                          to={`/editar-evento/${evento.id}`} 
                          className="event-action-btn edit-btn"
                        >
                          Editar
                        </Link>
                        <button
                          onClick={() => {
                            if (window.confirm(`¿Estás seguro de que quieres eliminar el evento "${evento.nombre}"?`)) {
                              console.log(`Eliminando evento ${evento.id}`);
                              // Implementar lógica de eliminación
                            }
                          }}
                          className="event-action-btn delete-btn"
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomeAdmin;