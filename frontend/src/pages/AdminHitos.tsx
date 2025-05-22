// src/pages/AdminHitos.tsx
import React, { useState, useEffect } from 'react';
import Navbar from '../components/common/Navbar';
import { Hito, getHitosByEventoId, deleteHito, getEventos } from '../services/hitoService'; // También importamos getEventos
import HitoForm from '../components/hitos/HitoForm'; // El formulario que acabamos de crear
import { Evento } from '../services/eventoService'; // Necesitamos la interfaz Evento
import '../assets/styles/AdminHitos.css'; // Asegúrate de crear este CSS

const AdminHitos: React.FC = () => {
  const [hitos, setHitos] = useState<Hito[]>([]);
  const [eventos, setEventos] = useState<Evento[]>([]); // Para el filtro por evento
  const [selectedEventoId, setSelectedEventoId] = useState<number | 'all'>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false); // Para mostrar/ocultar el formulario
  const [editingHitoId, setEditingHitoId] = useState<number | undefined>(undefined);

  const fetchHitos = async () => {
    setLoading(true);
    setError(null);
    try {
      const allEvents = await getEventos(); // Obtener todos los eventos para el filtro
      setEventos(allEvents);

      let fetchedHitos: Hito[] = [];
      if (selectedEventoId === 'all') {
        
        // Mejor opción sería:
        const allHitosPromises = allEvents.map(event => getHitosByEventoId(event.id));
        const nestedHitos = await Promise.all(allHitosPromises);
        fetchedHitos = nestedHitos.flat();

      } else {
        fetchedHitos = await getHitosByEventoId(selectedEventoId as number);
      }
      setHitos(fetchedHitos);
    } catch (err: any) {
      setError(err.message || 'Error al cargar los hitos.');
      console.error("Error fetching hitos:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHitos();
  }, [selectedEventoId]); // Recargar hitos cuando cambie el filtro de evento

  const handleEdit = (hitoId: number) => {
    setEditingHitoId(hitoId);
    setShowForm(true);
  };

  const handleDelete = async (hitoId: number) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este hito?')) {
      try {
        await deleteHito(hitoId);
        fetchHitos(); // Recargar la lista después de eliminar
      } catch (err: any) {
        alert(`Error al eliminar hito: ${err.message}`);
        console.error("Error deleting hito:", err);
      }
    }
  };

  const handleSaveHito = () => {
    setShowForm(false);
    setEditingHitoId(undefined);
    fetchHitos(); // Recargar la lista de hitos
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingHitoId(undefined);
  };

  // Función de utilidad para obtener el nombre del evento por su ID
  const getEventName = (eventoId: number) => {
    const event = eventos.find(e => e.id === eventoId);
    return event ? event.nombre : 'Evento Desconocido';
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-400 to-indigo-600">
      <Navbar />
      <div className="container mx-auto p-4">
        <h2 className="text-4xl font-bold text-white mb-6">Gestión de Hitos</h2>

        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => { setShowForm(true); setEditingHitoId(undefined); }} // Botón para crear nuevo hito
            className="bg-violet-700 hover:bg-violet-800 text-white font-bold py-2 px-4 rounded transition duration-300"
          >
            <i className="fas fa-plus"></i> Crear Nuevo Hito
          </button>

          {/* Selector de Eventos para filtrar hitos */}
          <select
            value={selectedEventoId}
            onChange={(e) => setSelectedEventoId(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
            className="shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          >
            <option value="all">Todos los Eventos</option>
            {eventos.map(evento => (
              <option key={evento.id} value={evento.id}>
                {evento.nombre}
              </option>
            ))}
          </select>
        </div>

        {showForm && (
          <div className="mb-8">
            <HitoForm
              hitoId={editingHitoId}
              onSave={handleSaveHito}
              onCancel={handleCancelForm}
            />
          </div>
        )}

        {loading ? (
          <p className="text-white text-center">Cargando hitos...</p>
        ) : error ? (
          <p className="text-red-300 text-center">Error: {error}</p>
        ) : hitos.length === 0 ? (
          <p className="text-white text-lg">No hay hitos para mostrar {selectedEventoId !== 'all' ? `para este evento.` : `.`}</p>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-6">
            <table className="min-w-full leading-normal">
              <thead>
                <tr>
                  <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Hito
                  </th>
                  <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Evento
                  </th>
                  <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {hitos.map((hito) => (
                  <tr key={hito.id} className="hover:bg-gray-50">
                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                      <p className="text-gray-900 whitespace-no-wrap">{hito.nombre}</p>
                      {hito.descripcion && <p className="text-gray-600 text-xs">{hito.descripcion}</p>}
                    </td>
                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                      <p className="text-gray-900 whitespace-no-wrap">{getEventName(hito.eventoId)}</p>
                    </td>
                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                      <p className="text-gray-900 whitespace-no-wrap">{hito.fecha}</p>
                    </td>
                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                      <span
                        className={`relative inline-block px-3 py-1 font-semibold leading-tight ${
                          hito.completado ? 'text-green-900' : 'text-red-900'
                        }`}
                      >
                        <span
                          aria-hidden
                          className={`absolute inset-0 ${
                            hito.completado ? 'bg-green-200' : 'bg-red-200'
                          } opacity-50 rounded-full`}
                        ></span>
                        <span className="relative">{hito.completado ? 'Completado' : 'Pendiente'}</span>
                      </span>
                    </td>
                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                      <button
                        onClick={() => handleEdit(hito.id)}
                        
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(hito.id)}
                        
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
  );
};

export default AdminHitos;