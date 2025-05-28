// src/pages/AdminHitos.tsx
import React, { useState, useEffect } from 'react';
import Navbar from '../components/common/Navbar';
// Corregida la importación de getEventos desde eventoService
import { Hito, getHitosByEventoId, deleteHito } from '../services/hitoService'; 
import { Evento, getEventos, getEventoById } from '../services/eventoService'; // ¡Importación corregida!
import { getParticipantesByEventoId } from '../services/eventoService';
import type { ParticipanteEvento } from '../services/eventoService';
import HitoForm from '../components/hitos/HitoForm';
import '../assets/styles/AdminHitos.css';

const AdminHitos: React.FC = () => {
  const [hitos, setHitos] = useState<Hito[]>([]);
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [selectedEventoId, setSelectedEventoId] = useState<number | 'all'>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingHitoId, setEditingHitoId] = useState<number | undefined>(undefined);
  const [participantes, setParticipantes] = useState<ParticipanteEvento[]>([]);

  const fetchHitos = async () => {
    setLoading(true);
    setError(null);
    try {
      const allEvents = await getEventos();
      setEventos(allEvents);

      let fetchedHitos: Hito[] = [];
      if (selectedEventoId !== 'all') {
        fetchedHitos = await getHitosByEventoId(selectedEventoId as number);

        try {
          const participantesData = await getParticipantesByEventoId(selectedEventoId as number);
          console.log("Participantes cargados desde el servicio:", participantesData); // Log para depuración
          setParticipantes(participantesData);
        } catch (err) {
          console.error(`Error al cargar participantes: ${err}`);
          setParticipantes([]);
        }
      } else {
        setParticipantes([]);
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
  }, [selectedEventoId]);

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

  const getEventName = (eventoId: number) => {
    const event = eventos.find(e => e.id === eventoId);
    return event ? event.nombre : 'Evento Desconocido';
  };

  return (
    <div className="admin-hitos-bg">
      <Navbar />
      <div className="admin-hitos-container">
        <h2 className="text-4xl font-bold text-white mb-6">Gestión de Hitos</h2>

        <div className="flex gap-4 mb-6 justify-center">
          <button
            onClick={() => { setShowForm(true); setEditingHitoId(undefined); }}
            className="hitoform-btn"
          >
            Crear Nuevo Hito
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
              eventoIdParent={selectedEventoId !== 'all' ? selectedEventoId as number : undefined}
              participantesEvento={selectedEventoId !== 'all' ? participantes : []}
              onSave={handleSaveHito}
              onCancel={handleCancelForm}
            />
          </div>
        )}

        {/* Lista de participantes si hay un evento seleccionado */}
        {selectedEventoId !== 'all' && participantes.length > 0 && (
          <div className="participantes-evento-box">
            <div className="participantes-evento-title">Participantes del evento</div>
            <div className="participantes-evento-list">
              {participantes.map((participante) => (
                <div key={participante.id} className="participante-item">
                  <span className="material-icons icon-person">person</span>
                  <span>
                    <strong>{participante.username}</strong> <span className="text-gray-500">({participante.nombre} {participante.apellido})</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

      

        {loading ? (
          <p className="text-white text-center">Cargando hitos...</p>
        ) : error ? (
          <p className="text-red-300 text-center">Error: {error}</p>
        ) : hitos.length === 0 ? (
          <p className="text-white text-lg">No hay hitos para mostrar {selectedEventoId !== 'all' ? `para este evento.` : `.`}</p>
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
                      {/* Cambia hito.nombre por hito.titulo si ese es el nombre en backend */}
                      <p className="text-gray-900 whitespace-no-wrap">{hito.titulo}</p>
                      {hito.descripcion && <p className="text-gray-600 text-xs">{hito.descripcion}</p>}
                    </td>
                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                      {/* Usar el ID correcto dependiendo de cómo lo nombra tu backend */}
                      <p className="text-gray-900 whitespace-no-wrap">
                        {getEventName(
                          hito.eventoId ?? -1
                        )}
                      </p>
                    </td>
                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                      {/* Usar el campo de fecha que corresponda a tu backend */}
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