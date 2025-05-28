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

  const fetchHitos = async () => {
    setLoading(true);
    setError(null);
    try {
      // Cargar todos los eventos (necesarios para el formulario de hitos)
      const allEvents = await getEventos();
      setEventos(allEvents);

      // Cargar todos los hitos directamente
      const fetchedHitos = await getAllHitos();
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
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingHitoId(undefined);
  };

  const getEventName = (eventoId: number) => {
    const event = eventos.find(e => e.id === eventoId);
    return event ? event.nombre : 'Evento Desconocido';
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
        </div>

        {showForm && (
          <div className="mb-8">
            <HitoForm
              hitoId={editingHitoId}
              participantesEvento={[]}
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