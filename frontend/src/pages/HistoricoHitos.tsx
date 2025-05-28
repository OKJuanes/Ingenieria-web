import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import { getAllHitos, Hito, deleteHito } from '../services/hitoService';
import { Evento, getEventosHistorico } from '../services/eventoService';
import { isAuthenticated, getUserData } from '../services/authService';
import '../assets/styles/HomeAdmin.css';
import '../assets/styles/Historico.css';
import Spinner from '../components/common/Spinner';
import { toast } from 'react-toastify';

const HistoricoHitos: React.FC = () => {
  const navigate = useNavigate();
  const [hitos, setHitos] = useState<Hito[]>([]);
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [filteredHitos, setFilteredHitos] = useState<Hito[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtroEventoId, setFiltroEventoId] = useState<string>('todos');
  const [filtroCategoria, setFiltroCategoria] = useState<string>('todas');
  const [busqueda, setBusqueda] = useState('');

  // Obtener categorías únicas de los hitos
  const categorias = React.useMemo(() => {
    if (!hitos.length) return [];
    const uniqueCategories = new Set<string>();
    hitos.forEach(hito => {
      if (hito.categoria) uniqueCategories.add(hito.categoria);
    });
    return Array.from(uniqueCategories);
  }, [hitos]);

  useEffect(() => {
    // Verificar si el usuario es administrador
    const currentUser = getUserData();
    if (!isAuthenticated() || currentUser?.role !== 'admin') {
      navigate('/login');
      return;
    }

    // Modifica la función fetchHistoricoHitos para garantizar que los eventos se carguen primero
    const fetchHistoricoHitos = async () => {
      setLoading(true);
      setError(null);
      try {
        // 1. Primero, cargar TODOS los eventos 
        console.log("Cargando eventos para el histórico...");
        const eventosData = await getEventosHistorico();
        setEventos(eventosData);
        
        // 2. Cargar todos los hitos
        console.log("Cargando hitos...");
        const hitosData = await getAllHitos();
        console.log("Hitos cargados:", hitosData);
        
        // No es necesario procesar más los hitos, el servicio ya lo hace
        setHitos(hitosData);
        setFilteredHitos(hitosData);
      } catch (err: any) {
        setError(err.message || 'Error al cargar el histórico de hitos');
        console.error("Error cargando histórico de hitos:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistoricoHitos();
  }, [navigate]);

  // Filtrar hitos según criterios
  useEffect(() => {
    if (!hitos.length) return;

    let resultado = [...hitos];

    // Filtrar por evento
    if (filtroEventoId !== 'todos') {
      resultado = resultado.filter(h => h.eventoId === parseInt(filtroEventoId, 10));
    }

    // Filtrar por categoría
    if (filtroCategoria !== 'todas') {
      resultado = resultado.filter(h => h.categoria === filtroCategoria);
    }

    // Aplicar búsqueda por texto
    if (busqueda.trim()) {
      const busquedaLower = busqueda.toLowerCase();
      resultado = resultado.filter(h => 
        h.titulo.toLowerCase().includes(busquedaLower) ||
        h.descripcion.toLowerCase().includes(busquedaLower) ||
        (h.beneficiario && h.beneficiario.username.toLowerCase().includes(busquedaLower))
      );
    }

    setFilteredHitos(resultado);
  }, [filtroEventoId, filtroCategoria, busqueda, hitos]);

  // Formatear fecha para mostrar
  const formatFecha = (fechaStr: string): string => {
    try {
      const date = new Date(fechaStr);
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString('es-ES', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      }
      return fechaStr;
    } catch (err) {
      return fechaStr;
    }
  };

  // Manejar eliminación de un hito
  const handleDelete = async (hitoId: number) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este hito? Esta acción no se puede deshacer.')) {
      try {
        await deleteHito(hitoId);
        setHitos(prev => prev.filter(h => h.id !== hitoId));
        setFilteredHitos(prev => prev.filter(h => h.id !== hitoId));
        toast.success('Hito eliminado exitosamente');
      } catch (err: any) {
        toast.error(`Error al eliminar el hito: ${err.message}`);
        console.error('Error deleting hito:', err);
      }
    }
  };

  return (
    <div className="historico-main-container">
      <Navbar />
      <div className="container mx-auto p-4">
        <h1 className="historico-title">Histórico de Hitos</h1>

        {/* Filtros */}
        <div className="historico-filtros">
          <div style={{ flex: 1 }}>
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar hitos..."
            />
          </div>
          <select 
            value={filtroEventoId}
            onChange={(e) => setFiltroEventoId(e.target.value)}
          >
            <option value="todos">Todos los eventos</option>
            {eventos.map(evento => (
              <option key={evento.id} value={String(evento.id)}>
                {evento.nombre}
              </option>
            ))}
          </select>
          <select 
            value={filtroCategoria}
            onChange={(e) => setFiltroCategoria(e.target.value)}
          >
            <option value="todas">Todas las categorías</option>
            {categorias.map(categoria => (
              <option key={categoria} value={categoria}>
                {categoria}
              </option>
            ))}
          </select>
        </div>

        {/* Tabla de hitos */}
        {loading ? (
          <div className="bg-white p-6 rounded-lg shadow-md flex justify-center">
            <Spinner />
          </div>
        ) : error ? (
          <div className="bg-red-100 p-6 rounded-lg shadow-md fade-in">
            <p className="text-red-700">{error}</p>
          </div>
        ) : filteredHitos.length === 0 ? (
          <div className="bg-white p-6 rounded-lg shadow-md fade-in">
            <p className="text-gray-700">No se encontraron hitos que coincidan con los criterios.</p>
          </div>
        ) : (
          <div className="historico-table-container fade-in">
            <table className="historico-table">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Título</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoría</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Evento</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Beneficiario</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredHitos.map((hito) => (
                  <tr key={hito.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{hito.titulo}</div>
                      <div className="text-xs text-gray-500">{hito.descripcion}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                        {hito.categoria}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {hito.eventoNombre || (hito.eventoId ? `Evento #${hito.eventoId}` : 'Sin evento')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {hito.beneficiario?.username || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {formatFecha(hito.fechaRegistro)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => navigate(`/admin/hitos/edit/${hito.id}`)}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(hito.id)}
                        className="text-red-600 hover:text-red-900"
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

export default HistoricoHitos;