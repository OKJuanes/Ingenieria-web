// src/pages/AdminHitos.tsx
import React, { useState, useEffect, useCallback } from 'react'; // Agregado useCallback
import Navbar from '../components/common/Navbar';
// Corregida la importación de getEventos desde eventoService
import { Hito, getHitosByEventoId, deleteHito, createHito, updateHito } from '../services/hitoService'; // Añadido createHito, updateHito
import { Evento, getEventos, updateEvent } from '../services/eventoService'; // ¡Importación corregida y añadido updateEvent!
import HitoForm from '../components/hitos/HitoForm'; // Componente existente para hitos
import EventoForm from '../components/eventos/EventoForm.tsx'; 
import { format } from 'date-fns'; // Para formatear fechas, asegúrate de instalar: npm install date-fns
import '../assets/styles/AdminHitos.css';

const AdminHitos: React.FC = () => {
  const [hitos, setHitos] = useState<Hito[]>([]);
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [selectedEventoId, setSelectedEventoId] = useState<number | 'all'>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingHitoId, setEditingHitoId] = useState<number | undefined>(undefined);

  // --- NUEVOS ESTADOS PARA GESTIÓN DE EVENTOS HISTÓRICOS ---
  const [eventosHistoricos, setEventosHistoricos] = useState<Evento[]>([]);
  const [eventoEditando, setEventoEditando] = useState<Evento | null>(null);
  // --- FIN NUEVOS ESTADOS ---

  const fetchHitosAndEvents = useCallback(async () => { // Renombrado para reflejar que trae ambos
    setLoading(true);
    setError(null);
    try {
      const allEvents = await getEventos(); // Obtener todos los eventos
      setEventos(allEvents);

      // --- LÓGICA PARA FILTRAR EVENTOS HISTÓRICOS ---
      const today = new Date();
      const historical = allEvents.filter(e => new Date(e.fecha) < today);
      setEventosHistoricos(historical.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())); // Ordenar del más reciente al más antiguo
      // --- FIN LÓGICA EVENTOS HISTÓRICOS ---

      let fetchedHitos: Hito[] = [];
      if (selectedEventoId === 'all') {
        // Obtenemos los hitos de CADA evento.
        // Esto es necesario si tu backend no tiene un endpoint para 'todos' los hitos.
        const allHitosPromises = allEvents.map(event => getHitosByEventoId(event.id));
        const nestedHitos = await Promise.all(allHitosPromises);
        fetchedHitos = nestedHitos.flat();
      } else {
        fetchedHitos = await getHitosByEventoId(selectedEventoId as number);
      }
      setHitos(fetchedHitos);
    } catch (err: any) {
      setError(err.message || 'Error al cargar los datos.');
      console.error("Error fetching hitos and events:", err);
    } finally {
      setLoading(false);
    }
  }, [selectedEventoId]); // selectedEventoId es una dependencia para recargar hitos al cambiar el filtro

  useEffect(() => {
    fetchHitosAndEvents();
  }, [fetchHitosAndEvents]); // Se ejecuta cuando fetchHitosAndEvents cambie (al montar)

  const handleEdit = (hitoId: number) => {
    setEditingHitoId(hitoId);
    setShowForm(true);
  };

  const handleDelete = async (hitoId: number) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este hito?')) {
      try {
        await deleteHito(hitoId);
        fetchHitosAndEvents(); // Recargar la lista después de eliminar
      } catch (err: any) {
        alert(`Error al eliminar hito: ${err.message}`);
        console.error("Error deleting hito:", err);
      }
    }
  };

  const handleSaveHito = async (hitoData: Hito | Omit<Hito, 'id'>) => {
    try {
      if ('id' in hitoData && hitoData.id !== 0) { // Si tiene ID y no es 0, es edición
        await updateHito(hitoData as Hito);
        alert('Hito actualizado exitosamente!');
      } else { // Es un nuevo hito
        await createHito(hitoData as Omit<Hito, 'id'>);
        alert('Hito creado exitosamente!');
      }
      setShowForm(false);
      setEditingHitoId(undefined);
      fetchHitosAndEvents(); // Recargar la lista de hitos
    } catch (err: any) {
      alert(`Error al guardar hito: ${err.message}`);
      console.error("Error saving hito:", err);
    }
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingHitoId(undefined);
  };

  const getEventName = (eventoId: number) => {
    const event = eventos.find(e => e.id === eventoId);
    return event ? event.nombre : 'Evento Desconocido';
  };

  // --- NUEVAS FUNCIONES PARA GESTIÓN DE EVENTOS ---
  const handleEditEvent = (evento: Evento) => {
    setEventoEditando(evento);
  };

  const handleSaveEvent = async (updatedEvent: Evento) => {
    try {
      await updateEvent(updatedEvent);
      alert('Evento actualizado exitosamente!');
      setEventoEditando(null); // Cerrar el formulario de edición
      fetchHitosAndEvents(); // Recargar todos los eventos (incluyendo históricos)
    } catch (err: any) {
      alert(`Error al actualizar el evento: ${err.message}`);
      console.error("Error updating event:", err);
    }
  };

  const handleCancelEditEvent = () => {
    setEventoEditando(null); // Cerrar el formulario de edición
  };
  // --- FIN NUEVAS FUNCIONES ---

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-purple-400 to-indigo-600 flex items-center justify-center">
        <p className="text-white text-2xl">Cargando datos de administrador...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-purple-400 to-indigo-600 flex items-center justify-center">
        <p className="text-red-300 text-2xl">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-400 to-indigo-600">
      <Navbar />
      <div className="container mx-auto p-4">
        <h2 className="text-4xl font-bold text-white mb-6">Panel de Administración</h2>

        {/* --- NUEVA SECCIÓN: Histórico de Eventos para Edición --- */}
        <section className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">Histórico de Eventos (Edición)</h3>
          {eventosHistoricos.length === 0 ? (
            <p className="text-gray-600">No hay eventos históricos disponibles para editar.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {eventosHistoricos.map(evento => (
                <div key={evento.id} className="bg-gray-100 p-4 rounded-lg shadow-sm flex flex-col justify-between">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800">{evento.nombre}</h4>
                    <p className="text-gray-600 text-sm">Fecha: {format(new Date(evento.fecha), 'dd/MM/yyyy')}</p>
                    <p className="text-gray-700 mt-2">{evento.descripcion}</p>
                  </div>
                  <button
                    onClick={() => handleEditEvent(evento)}
                    className="mt-4 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-300 self-end"
                  >
                    Editar Evento
                  </button>
                </div>
              ))}
            </div>
          )}

          {eventoEditando && (
            <div className="mt-8 bg-gray-50 p-6 rounded-lg shadow-inner">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Editando: {eventoEditando.nombre}</h3>
              <EventoForm
                evento={eventoEditando}
                onSave={handleSaveEvent}
                onCancel={handleCancelEditEvent}
              />
            </div>
          )}
        </section>
        {/* --- FIN NUEVA SECCIÓN --- */}


        <h2 className="text-4xl font-bold text-white mb-6">Gestión de Hitos</h2>

        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => { setShowForm(true); setEditingHitoId(undefined); }}
            className="bg-violet-700 hover:bg-violet-800 text-white font-bold py-2 px-4 rounded transition duration-300"
          >
            <i className="fas fa-plus"></i> Crear Nuevo Hito
          </button>

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
              onSave={handleSaveHito} // handleSaveHito ahora maneja creación y edición
              onCancel={handleCancelForm}
              eventoIdContext={selectedEventoId !== 'all' ? selectedEventoId : undefined} // Pasar el eventoId seleccionado
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
                        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-3 rounded text-xs mr-2"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(hito.id)}
                        className="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-3 rounded text-xs"
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