// src/pages/HomeAdmin.tsx
import React, { useEffect, useState } from 'react';
import Navbar from '../components/common/Navbar';
import { 
  getEventStats, 
  getRecentEvents, 
  Evento, 
  generateEventsReportCsv, 
  getEventos, 
  deleteEvento 
} from '../services/eventoService';
import { Link, useNavigate } from 'react-router-dom'; // Para la navegación
import EventoCard from '../components/eventos/EventoCard'; // Para mostrar eventos recientes
import '../assets/styles/HomeAdmin.css'; // Tu archivo de estilos para HomeAdmin
import 'bootstrap/dist/css/bootstrap.min.css';
import { toast } from 'react-toastify';

function parseFecha(fechaStr: string): Date {
  // Si el formato es dd-mm-yyyy
  const [dia, mes, anio] = fechaStr.split('-');
  return new Date(Number(anio), Number(mes) - 1, Number(dia));
}

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
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTipo, setFilterTipo] = useState('');
  const [filterFecha, setFilterFecha] = useState('');
  const [filterEstado, setFilterEstado] = useState('');

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
    setLoadingRecent(true);
    try {
      const csvData = await generateEventsReportCsv();
      const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', 'reporte_eventos_y_participantes.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('Reporte generado exitosamente.');
    } catch (err: any) {
      toast.error(`Error al generar el reporte: ${err.message || 'Error desconocido'}`);
    } finally {
      setLoadingRecent(false);
    }
  };
  const handleManageMilestones = () => {
    navigate('/admin/hitos'); // Redirige a la nueva página de gestión de hitos
  };
  // Añadir esta función para manejar la navegación al histórico
  const handleViewHistorico = () => {
    navigate('/admin/historico-eventos');
  };
  // Añadir esta función para manejar la navegación al histórico de hitos
  const handleViewHistoricoHitos = () => {
    navigate('/admin/historico-hitos');
  };

  // Filtrado de eventos para la tabla de gestión
  const eventosFiltrados = eventos.filter(evento => {
    const matchNombre = evento.nombre.toLowerCase().includes(searchTerm.toLowerCase());
    const matchTipo = filterTipo ? evento.tipo === filterTipo : true;

    // Usa el parser para comparar fechas correctamente
    const hoy = new Date();
    hoy.setHours(0,0,0,0);
    const fechaEvento = parseFecha(evento.fecha);
    fechaEvento.setHours(0, 0, 0, 0);

    let matchEstado = true;
    if (filterEstado === 'ACTIVO') {
      matchEstado = fechaEvento >= hoy;
    } else if (filterEstado === 'FINALIZADO') {
      matchEstado = fechaEvento < hoy;
    }

    return matchNombre && matchTipo && matchEstado;
  });

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
          {/* Eliminamos el botón de Generar Reporte */}
          {/* Nuevo botón para el histórico */}
          <button 
            onClick={handleViewHistorico} 
            className="action-button historico-button"
          >
            Ver Histórico
          </button>
          {/* Botón para el histórico de hitos */}
          <button 
            onClick={handleViewHistoricoHitos} 
            className="action-button historico-hitos-button"
          >
            Ver Histórico Hitos
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
          {/* Filtros y buscador */}
          <div className="event-filters mb-6 flex flex-wrap gap-4 items-center">
            <input
              type="text"
              placeholder="Buscar por nombre..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="filter-input"
            />
            <select
              value={filterTipo}
              onChange={e => setFilterTipo(e.target.value)}
              className="filter-select"
            >
              <option value="">Todos los tipos</option>
              <option value="BOOTCAMP">Bootcamp</option>
              <option value="HACKATON">Hackatón</option>
              <option value="CHARLA">Charla</option>
              <option value="CONCURSO">Concurso</option>
              <option value="OTROS">Otros</option>
            </select>
            <select
              value={filterEstado}
              onChange={e => setFilterEstado(e.target.value)}
              className="filter-select"
            >
              <option value="">Todos los estados</option>
              <option value="ACTIVO">Activo</option>
              <option value="FINALIZADO">Finalizado</option>
            </select>
          </div>
          {loading ? (
            <p className="loading-text">Cargando eventos...</p>
          ) : error ? (
            <p className="error-text">Error al cargar eventos: {error}</p>
          ) : eventosFiltrados.length === 0 ? (
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
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {eventosFiltrados.map((evento) => (
                    <tr key={evento.id}>
                      {/* <td>{evento.id}</td> */} {/* Elimina o comenta esta línea */}
                      <td>{evento.nombre}</td>
                      <td>{evento.fecha}</td>
                      <td>{evento.tipo}</td>
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
                              deleteEvento(evento.id)
                                .then(() => {
                                  setEventos(eventos.filter(e => e.id !== evento.id));
                                  toast.success(`Evento "${evento.nombre}" eliminado exitosamente.`);
                                })
                                .catch(err => {
                                  console.error("Error eliminando evento:", err);
                                  toast.error(`Error al eliminar el evento: ${err.message}`);
                                });
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