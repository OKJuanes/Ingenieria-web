import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import { getEventosHistorico, Evento } from '../services/eventoService';
import { isAuthenticated, getUserData } from '../services/authService';
import '../assets/styles/HomeAdmin.css';

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

    // Aplicar filtro por estado
    if (filtro === 'pasados') {
      resultado = resultado.filter(e => new Date(e.fecha) < ahora);
    } else if (filtro === 'futuros') {
      resultado = resultado.filter(e => new Date(e.fecha) >= ahora);
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

  // Función para verificar si un evento es pasado
  const esPasado = (fecha: string): boolean => {
    return new Date(fecha) < new Date();
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-400 to-indigo-600">
      <Navbar />
      <div className="container mx-auto p-4">
        <h1 className="text-4xl font-bold text-white mb-6">Histórico de Eventos</h1>

        {/* Filtros */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex-1">
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar eventos..."
              className="w-full p-2 border rounded shadow"
            />
          </div>

          <select 
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            className="p-2 border rounded shadow bg-white"
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
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Empresa</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Participantes</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredEventos.map((evento) => (
                    <tr key={evento.id} className={esPasado(evento.fecha) ? "bg-gray-50" : "hover:bg-gray-50"}>
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
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          esPasado(evento.fecha) 
                            ? "bg-gray-100 text-gray-800" 
                            : "bg-green-100 text-green-800"
                        }`}>
                          {esPasado(evento.fecha) ? "Finalizado" : "Activo"}
                        </span>
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
          </div>
        )}

        <div className="mt-6">
          <button
            onClick={() => navigate('/home-admin')}
            className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
          >
            Volver al Panel
          </button>
        </div>
      </div>
    </div>
  );
};

export default HistoricoEventos;