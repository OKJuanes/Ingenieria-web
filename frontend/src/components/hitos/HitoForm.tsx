// src/components/hitos/HitoForm.tsx
import React, { useState, useEffect } from 'react';
import { Hito, createHito, getHitoById, updateHito } from '../../services/hitoService';
import { Evento, getEventos, getParticipantesByEventoId, ParticipanteEvento } from '../../services/eventoService';
import '../../assets/styles/HitoForm.css';

export interface HitoFormProps {
  hitoId?: number;
  eventoIdParent?: number;
  participantesEvento: ParticipanteEvento[];
  onSave: () => void;
  onCancel: () => void;
}

const HitoForm: React.FC<HitoFormProps> = ({ 
  hitoId, 
  eventoIdParent, 
  onSave, 
  onCancel 
}) => {
  const isEditing = !!hitoId;
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [participantes, setParticipantes] = useState<ParticipanteEvento[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Estado para el hito
  const [hitoData, setHitoData] = useState<Hito>({
    id: 0,
    titulo: '',
    descripcion: '',
    categoria: '',
    fechaRegistro: new Date().toISOString().split('T')[0],
    eventoId: eventoIdParent || 0,
    completado: false
  });

  // Estado para el usuario seleccionado
  const [usuarioGanadorId, setUsuarioGanadorId] = useState<number | ''>('');

  // Cargar eventos al iniciar
  useEffect(() => {
    const fetchEventos = async () => {
      try {
        const fetchedEventos = await getEventos();
        setEventos(fetchedEventos);

        // Si no estamos editando y no hay evento preseleccionado, seleccionar el primero
        if (!isEditing && !eventoIdParent && fetchedEventos.length > 0) {
          setHitoData(prev => ({ ...prev, eventoId: fetchedEventos[0].id }));
        }
      } catch (err: any) {
        console.error("Error cargando eventos:", err);
      }
    };
    fetchEventos();
  }, [isEditing, eventoIdParent]);

  // Cargar participantes cuando cambia el evento seleccionado
  useEffect(() => {
    const fetchParticipantes = async () => {
      if (!hitoData.eventoId) return;

      try {
        const fetchedParticipantes = await getParticipantesByEventoId(hitoData.eventoId);
        console.log("Participantes cargados:", fetchedParticipantes); // Log para depuración
        setParticipantes(fetchedParticipantes);
      } catch (err: any) {
        console.error(`Error cargando participantes del evento ${hitoData.eventoId}:`, err);
        setParticipantes([]);
      }
    };

    fetchParticipantes();
  }, [hitoData.eventoId]);

  // Manejar cambios en los inputs
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;

    // Si cambia el evento, resetear el usuario ganador
    if (name === 'eventoId') {
      setUsuarioGanadorId('');
      // Convertir explícitamente a número para eventoId
      const numValue = value ? Number(value) : 0;
      setHitoData(prev => ({
        ...prev,
        [name]: numValue
      }));
    } else {
      setHitoData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
      }));
    }
  };

  // Manejar envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usuarioGanadorId) {
      setError("Debe seleccionar un usuario ganador");
      return;
    }

    if (!hitoData.eventoId || typeof hitoData.eventoId !== 'number') {
      setError("Evento inválido, seleccione un evento válido");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const hitoToSave = {
        userId: usuarioGanadorId as number,
        titulo: hitoData.titulo,
        descripcion: hitoData.descripcion,
        categoria: hitoData.categoria,
        completado: hitoData.completado,
        fechaRegistro: hitoData.fechaRegistro,
        eventoId: Number(hitoData.eventoId),
      };

      console.log("Hito a guardar:", hitoToSave);
      console.log("Evento ID:", hitoData.eventoId);

      await createHito(hitoToSave.eventoId, hitoToSave);

      setSuccess("Hito guardado exitosamente");
      setTimeout(() => {
        onSave();
      }, 1500);
    } catch (err: any) {
      setError(`Error al guardar el hito: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-semibold mb-4">{isEditing ? 'Editar Hito' : 'Crear Hito'}</h3>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}
      {success && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">{success}</div>}

      <form onSubmit={handleSubmit}>
        {/* Evento Asociado */}
        <div className="mb-4">
          <label htmlFor="eventoId" className="block text-gray-700 font-semibold mb-1">Evento Asociado:</label>
          <select
            id="eventoId"
            name="eventoId"
            value={hitoData.eventoId || ''}
            onChange={handleChange}
            className="w-full border rounded p-2"
            disabled={!!eventoIdParent || isEditing}
            required
          >
            <option value="">Selecciona un evento</option>
            {eventos.map(evento => (
              <option key={evento.id} value={evento.id}>{evento.nombre}</option>
            ))}
          </select>
        </div>

        {/* Título del Hito */}
        <div className="mb-4">
          <label htmlFor="titulo" className="block text-gray-700 font-semibold mb-1">Título del Hito:</label>
          <input
            type="text"
            id="titulo"
            name="titulo"
            value={hitoData.titulo || ''}
            onChange={handleChange}
            className="w-full border rounded p-2"
            required
          />
        </div>

        {/* Descripción */}
        <div className="mb-4">
          <label htmlFor="descripcion" className="block text-gray-700 font-semibold mb-1">Descripción:</label>
          <textarea
            id="descripcion"
            name="descripcion"
            value={hitoData.descripcion || ''}
            onChange={handleChange}
            className="w-full border rounded p-2"
            rows={4}
            required
          />
        </div>

        {/* Categoría */}
        <div className="mb-4">
          <label htmlFor="categoria" className="block text-gray-700 font-semibold mb-1">Categoría:</label>
          <select
            id="categoria"
            name="categoria"
            value={hitoData.categoria || ''}
            onChange={handleChange}
            className="w-full border rounded p-2"
            required
          >
            <option value="">Selecciona una categoría</option>
            <option value="LOGRO">Logro</option>
            <option value="META">Meta</option>
            <option value="OTRO">Otro</option>
          </select>
        </div>

        {/* Usuario Ganador */}
        <div className="mb-4">
          <label htmlFor="usuarioGanadorId" className="block text-gray-700 font-semibold mb-1">Usuario Ganador:</label>
          <select
            id="usuarioGanadorId"
            name="usuarioGanadorId"
            value={usuarioGanadorId}
            onChange={(e) => setUsuarioGanadorId(e.target.value ? Number(e.target.value) : '')}
            className="w-full border rounded p-2"
            required
          >
            <option value="">Selecciona un usuario</option>
            {participantes.map(participante => (
              <option key={participante.id} value={participante.id}>
                {participante.username} ({participante.nombre} {participante.apellido})
              </option>
            ))}
          </select>

          {hitoData.eventoId && participantes.length === 0 && (
            <p className="text-yellow-600 text-sm mt-1">
              No hay participantes registrados para este evento.
            </p>
          )}
        </div>

        {/* Botones de acción */}
        <div className="flex justify-end space-x-2">
          <button 
            type="button" 
            onClick={onCancel}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
          >
            Cancelar
          </button>
          <button 
            type="submit"
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
            disabled={loading}
          >
            {loading ? 'Guardando...' : (isEditing ? 'Actualizar' : 'Crear')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default HitoForm;