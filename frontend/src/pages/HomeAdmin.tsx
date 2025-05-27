// src/pages/HomeAdmin.tsx
import React, { useEffect, useState } from 'react';
import Navbar from '../components/common/Navbar';
import { getEventStats, getRecentEvents, Evento, generateEventsReportCsv, getEventos } from '../services/eventoService';
import { Link, useNavigate } from 'react-router-dom';
import EventoCard from '../components/eventos/EventoCard';
import '../assets/styles/HomeAdmin.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../assets/styles/global.css';

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
  return (
    <div className="home-admin-container min-h-screen bg-gradient-to-r from-purple-400 to-indigo-600">
      <Navbar />
      <div className="home-admin-content container mx-auto p-6">
        <h2 className="panel-title text-4xl font-bold text-white mb-8">Panel de Administración</h2>

        {/* Estadísticas */}
        <div className="stats-grid grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="stat-card bg-white rounded-lg shadow p-6 flex flex-col items-center">
            <div className="stat-icon text-3xl mb-2">📅</div>
            <h3 className="text-lg font-semibold mb-1">Eventos Activos</h3>
            <p className="stat-value text-2xl font-bold">{stats.eventosActivos}</p>
          </div>
          <div className="stat-card bg-white rounded-lg shadow p-6 flex flex-col items-center">
            <div className="stat-icon text-3xl mb-2">👥</div>
            <h3 className="text-lg font-semibold mb-1">Total Participantes</h3>
            <p className="stat-value text-2xl font-bold">{stats.totalParticipantes}</p>
          </div>
          <div className="stat-card bg-white rounded-lg shadow p-6 flex flex-col items-center">
            <div className="stat-icon text-3xl mb-2">🔜</div>
            <h3 className="text-lg font-semibold mb-1">Próximo Evento</h3>
            <p className="stat-value text-2xl font-bold">{stats.proximoEvento}</p>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="action-buttons flex flex-wrap gap-4 mb-10">
          <button
            onClick={handleCreateEvent}
            className="action-button create-button bg-violet-700 hover:bg-violet-800 text-white font-bold py-2 px-6 rounded transition"
          >
            <i className="fas fa-plus mr-2"></i>Crear Evento
          </button>
          <button
            onClick={handleManageMilestones}
            className="action-button manage-button bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-6 rounded transition"
          >
            <i className="fas fa-trophy mr-2"></i>Gestionar Hitos
          </button>
          <button
            onClick={handleGenerateReport}
            className="action-button report-button bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded transition"
          >
            <i className="fas fa-file-export mr-2"></i>Generar Reporte
          </button>
        </div>

        {/* Eventos recientes */}
        <div className="recent-events-section mb-10">
          <h3 className="section-title text-2xl font-semibold text-white mb-4">📋 Eventos Recientes</h3>
          {loadingRecent ? (
            <p className="loading-text text-white">Cargando eventos recientes...</p>
          ) : errorRecent ? (
            <p className="error-text text-red-300">Error al cargar eventos: {errorRecent}</p>
          ) : recentEvents.length === 0 ? (
            <p className="empty-text text-white">No hay eventos recientes para mostrar.</p>
          ) : (
            <div className="events-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

        {/* Gestión de eventos */}
        <div className="admin-eventos bg-white bg-opacity-10 p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-semibold mb-4 text-white">Gestión de Eventos</h3>
          {loading ? (
            <p className="text-white text-center p-4">Cargando eventos...</p>
          ) : error ? (
            <p className="text-red-300 text-center p-4">Error: {error}</p>
          ) : eventos.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white rounded shadow">
                <thead>
                  <tr className="bg-violet-700 text-white">
                    <th className="py-2 px-4 text-left">Nombre</th>
                    <th className="py-2 px-4 text-left">Fecha</th>
                    <th className="py-2 px-4 text-left">Tipo</th>
                    <th className="py-2 px-4 text-left">Descripción</th>
                    <th className="py-2 px-4 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {eventos.map((evento) => (
                    <tr key={evento.id} className="border-b border-gray-200 hover:bg-violet-100 transition">
                      <td className="py-2 px-4">{evento.nombre}</td>
                      <td className="py-2 px-4">{evento.fecha}</td>
                      <td className="py-2 px-4">{evento.tipo}</td>
                      <td className="py-2 px-4">
                        {evento.descripcion && evento.descripcion.length > 100
                          ? `${evento.descripcion.substring(0, 100)}...`
                          : evento.descripcion}
                      </td>
                      <td className="py-2 px-4 text-center">
                        <div className="flex justify-center gap-2">
                          <Link
                            to={`/eventos/${evento.id}`}
                            className="btn btn-outline-primary btn-sm"
                          >
                            Ver
                          </Link>
                          <Link
                            to={`/editar-evento/${evento.id}`}
                            className="btn btn-outline-success btn-sm"
                          >
                            Editar
                          </Link>
                          <button
                            className="btn btn-outline-danger btn-sm"
                            onClick={() => {
                              if (window.confirm(`¿Estás seguro de que quieres eliminar el evento "${evento.nombre}"?`)) {
                                // Aquí iría la función para eliminar el evento
                                console.log(`Eliminando evento ${evento.id}`);
                              }
                            }}
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-white text-center p-4">No hay eventos disponibles.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomeAdmin;