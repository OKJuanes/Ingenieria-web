// src/pages/AdminHitos.tsx
import React, { useState, useEffect } from 'react';
import Navbar from '../components/common/Navbar';
import { Hito, deleteHito, getAllHitos } from '../services/hitoService'; 
import { Evento, getEventos } from '../services/eventoService';
import HitoForm from '../components/hitos/HitoForm';
import '../assets/styles/AdminHitos.css';
import { toast } from 'react-toastify';

const AdminHitos: React.FC = () => {
  const [hitos, setHitos] = useState<Hito[]>([]);
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingHitoId, setEditingHitoId] = useState<number | undefined>(undefined);

  // Ahora separamos las funciones de carga para mejor control
  const fetchEventos = async () => {
    try {
      console.log("Cargando eventos...");
      const allEvents = await getEventos();
      console.log(`Eventos cargados: ${allEvents.length}`);
      setEventos(allEvents);
      return allEvents;
    } catch (err: any) {
      console.error("Error al cargar eventos:", err);
      toast.error("Error al cargar eventos");
      setError(err.message || 'Error al cargar eventos');
      return [];
    }
  };

  const fetchHitos = async () => {
    setLoading(true);
    setError(null);
    try {
      // Primero cargar SIEMPRE los eventos y esperar a que se complete
      console.log("Cargando eventos...");
      const eventosData = await fetchEventos();
      setEventos(eventosData); // Asegurar que el estado se actualice
      
      // Luego cargar los hitos
      console.log("Cargando hitos...");
      const fetchedHitos = await getAllHitos();
      console.log(`Hitos cargados: ${fetchedHitos.length}`);
      setHitos(fetchedHitos);
    } catch (err: any) {
      setError(err.message || 'Error al cargar los datos.');
      console.error("Error en fetchHitos:", err);
    } finally {
      setLoading(false);
    }
  };

  // Cargar datos al montar el componente
  useEffect(() => {
    console.log("Componente AdminHitos montado - Cargando datos iniciales");
    fetchHitos();
    
    // Función de limpieza para useEffect
    return () => {
      console.log("Componente AdminHitos desmontado");
    };
  }, []);

  const handleEdit = (hitoId: number) => {
    setEditingHitoId(hitoId);
    setShowForm(true);
  };

  const handleDelete = async (hitoId: number) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este hito?')) {
      try {
        await deleteHito(hitoId);
        fetchHitos();
        toast.success('Hito eliminado exitosamente');
      } catch (err: any) {
        toast.error(`Error al eliminar el hito: ${err.message}`);
      }
    }
  };

  const handleSaveHito = () => {
    setShowForm(false);
    setEditingHitoId(undefined);
    fetchHitos(); // Recargar la lista de hitos
    toast.success('Hito guardado exitosamente');
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingHitoId(undefined);
  };

  const getEventName = (eventoId: number | null | undefined) => {
    if (!eventoId) return 'Sin evento asociado';
    
    console.log(`Buscando evento con ID: ${eventoId}`);
    console.log(`Eventos disponibles: ${eventos.length}`);

    // Convertir a número para asegurar consistencia
    const eventIdNum = Number(eventoId);
    const event = eventos.find(e => e.id === eventIdNum);
    
    if (event) {
      console.log(`Evento encontrado: ${event.nombre}`);
      return event.nombre;
    } else {
      console.log(`No se encontró evento con ID: ${eventIdNum}`);
      return 'Evento Desconocido';
    }
  };

  return (
    <div className="admin-hitos-bg">
      <Navbar />
      <div className="admin-hitos-container">
        <h2 className="text-4xl font-bold text-white mb-6">Gestión de Hitos</h2>

        <div className="flex justify-center mb-6">
          <button
            onClick={() => { setShowForm(true); setEditingHitoId(undefined); }}
            className="hitoform-btn px-8 py-3 text-lg"
          >
            Crear Nuevo Hito
          </button>
          {/* Añadimos un botón para recargar datos */}
          <button
            onClick={fetchHitos}
            className="hitoform-btn px-8 py-3 text-lg ml-4"
          >
            Actualizar lista
          </button>
        </div>

        {showForm && (
          <div className="mb-8">
            <HitoForm
              hitoId={editingHitoId}
              participantesEvento={[]}
              eventos={eventos} // Pasar los eventos cargados al formulario
              onSave={handleSaveHito}
              onCancel={handleCancelForm}
            />
          </div>
        )}

        {loading ? (
          <p className="text-white text-center">Cargando datos...</p>
        ) : error ? (
          <p className="text-red-300 text-center">Error: {error}</p>
        ) : hitos.length === 0 ? (
          <p className="text-white text-lg">No hay hitos para mostrar.</p>
        ) : (
          <div className="admin-hitos-table-wrapper">
            <table className="admin-hitos-table">
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
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {hitos.map((hito) => (
                  <tr key={hito.id} className="hover:bg-gray-50">
                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                      <p className="text-gray-900 whitespace-no-wrap">{hito.titulo}</p>
                      {hito.descripcion && <p className="text-gray-600 text-xs">{hito.descripcion}</p>}
                    </td>
                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                      <p className="text-gray-900 whitespace-no-wrap">
                        {getEventName(hito.eventoId ?? -1)}
                      </p>
                    </td>
                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                      <p className="text-gray-900 whitespace-no-wrap">
                        {hito.fechaRegistro}
                      </p>
                    </td>
                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                      <button
                        onClick={() => handleEdit(hito.id)}
                        className="hito-btn"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(hito.id)}
                        className="hito-btn hito-btn-delete"
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