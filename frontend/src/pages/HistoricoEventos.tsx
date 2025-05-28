import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import { getEventosHistorico, Evento } from '../services/eventoService';
import { isAuthenticated, getUserData } from '../services/authService';
import '../assets/styles/HomeAdmin.css';
import '../assets/styles/Historico.css';
const HistoricoEventos: React.FC = () => {
  const navigate = useNavigate();
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [filteredEventos, setFilteredEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtro, setFiltro] = useState('todos'); // todos, pasados, futuros
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    // Verificar si el usuario es administrador
    const currentUser = getUserData();
    if (!isAuthenticated() || currentUser?.role !== 'admin') {
      navigate('/login');
      return;
    }

    // Cargar eventos históricos
    const fetchHistorico = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getEventosHistorico();
        setEventos(data);
        setFilteredEventos(data);
      } catch (err: any) {
        setError(err.message || 'Error al cargar el histórico de eventos');
        console.error("Error cargando histórico:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistorico();
  }, [navigate]);

  // Filtrar eventos según criterios
  useEffect(() => {
    if (!eventos.length) return;

    const ahora = new Date();
    let resultado = [...eventos];

    // Aplicar filtro por estado - CORREGIDO
    if (filtro === 'pasados') {
      resultado = resultado.filter(e => parseFecha(e.fecha) < ahora);
    } else if (filtro === 'futuros') {
      resultado = resultado.filter(e => parseFecha(e.fecha) >= ahora);
    }

    // Aplicar filtro por búsqueda
    if (busqueda.trim()) {
      const busquedaLower = busqueda.toLowerCase();
      resultado = resultado.filter(e => 
        e.nombre.toLowerCase().includes(busquedaLower) ||
        e.descripcion?.toLowerCase().includes(busquedaLower) ||
        e.tipo.toLowerCase().includes(busquedaLower) ||
        e.empresa?.toLowerCase().includes(busquedaLower)
      );
    }

    setFilteredEventos(resultado);
  }, [filtro, busqueda, eventos]);

  // Añade esta función en la parte superior del componente
  function parseFecha(fechaStr: string): Date {
    // Si el formato es dd-mm-yyyy
    const [dia, mes, anio] = fechaStr.split('-');
    return new Date(Number(anio), Number(mes) - 1, Number(dia));
  }

  // También actualiza la función esPasado
  const esPasado = (fecha: string): boolean => {
    return parseFecha(fecha) < new Date();
  };

  return (
    <div className="historico-main-container">
      <Navbar />
      <div className="container mx-auto p-4">
        <h1 className="historico-title">Histórico de Eventos</h1>

        {/* Filtros */}
        <div className="historico-filtros">
          <div style={{ flex: 1 }}>
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar eventos..."
            />
          </div>
          <select 
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
          >
            <option value="todos">Todos los eventos</option>
            <option value="pasados">Eventos pasados</option>
            <option value="futuros">Eventos futuros</option>
          </select>
        </div>

        {/* Tabla de eventos */}
        {loading ? (
          <div className="bg-white p-6 rounded-lg shadow-md flex justify-center">
            <p className="text-gray-700">Cargando histórico de eventos...</p>
          </div>
        ) : error ? (
          <div className="bg-red-100 p-6 rounded-lg shadow-md">
            <p className="text-red-700">{error}</p>
          </div>
        ) : filteredEventos.length === 0 ? (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <p className="text-gray-700">No se encontraron eventos que coincidan con los criterios.</p>
          </div>
        ) : (
          <div className="historico-table-container">
            <table className="historico-table">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Empresa</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Participantes</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredEventos.map((evento) => (
                  <tr key={evento.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{evento.nombre}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{evento.fecha}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{evento.tipo}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{evento.empresa || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{evento.cantidadParticipantes || 0}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => navigate(`/eventos/${evento.id}`)}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        Ver
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-6">
          <button
            onClick={() => navigate('/home-admin')}
            className="historico-btn"
          >
            Volver al Panel
          </button>
        </div>
      </div>
    </div>
  );
};

export default HistoricoEventos;