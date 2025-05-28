// src/components/hitos/HitoForm.tsx
import React, { useState, useEffect } from 'react';
import { Hito, createHito, getHitoById, updateHito } from '../../services/hitoService';
import {  getEventosHistorico, Evento, getParticipantesByEventoId, ParticipanteEvento } from '../../services/eventoService';
import '../../assets/styles/HitoForm.css';

export interface HitoFormProps {
  hitoId?: number;
  eventoIdParent?: number;
  participantesEvento: ParticipanteEvento[];
  onSave: () => void;
  onCancel: () => void;
  eventos: Evento[];

}

const HitoForm: React.FC<HitoFormProps> = ({ 
  hitoId, 
  eventoIdParent, 
  participantesEvento,
  onSave, 
  onCancel 
}) => {
  const isEditing = !!hitoId;
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [participantes, setParticipantes] = useState<ParticipanteEvento[]>(participantesEvento);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Estado para el hito
  const [hitoData, setHitoData] = useState<Hito>({
    id: 0,
    titulo: '',
    descripcion: '',
    categoria: '',
    fechaRegistro: new Date().toISOString().split('T')[0], // Fecha actual en formato YYYY-MM-DD
    eventoId: eventoIdParent || 0,
    completado: false
  });

  // Estado para el usuario seleccionado
  const [usuarioGanadorId, setUsuarioGanadorId] = useState<number | ''>('');

  // Cargar el hito existente cuando estamos editando
  useEffect(() => {
    if (isEditing && hitoId) {
      const fetchHito = async () => {
        setLoading(true);
        try {
          const hitoExistente = await getHitoById(hitoId);
          if (hitoExistente) {
            setHitoData(hitoExistente);
            // Si el hito tiene un userId (ganador), establecer su ID
            if (hitoExistente.usuarioGanadorId) {
              setUsuarioGanadorId(hitoExistente.usuarioGanadorId);
            }
          } else {
            setError("No se encontró el hito solicitado.");
          }
        } catch (err: any) {
          console.error("Error al cargar el hito:", err);
          setError(`Error al cargar el hito: ${err.message}`);
        } finally {
          setLoading(false);
        }
      };
      fetchHito();
    }
  }, [hitoId, isEditing]);

  // Cargar eventos al iniciar
  useEffect(() => {
    const fetchEventos = async () => {
      try {
        // Reemplazar getEventos por getEventosHistorico para obtener TODOS los eventos
        const fetchedEventos = await getEventosHistorico();
        setEventos(fetchedEventos);
        console.log("Eventos cargados para selector:", fetchedEventos.length);

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
        setParticipantes(fetchedParticipantes);
      } catch (err: any) {
        console.error(`Error cargando participantes del evento ${hitoData.eventoId}:`, err);
        setParticipantes([]);
      }
    };

    if (participantesEvento.length === 0) {
      fetchParticipantes();
    }
  }, [hitoData.eventoId, participantesEvento]);

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
        ...hitoData, // Mantener el ID si estamos editando
        userId: usuarioGanadorId as number,
        titulo: hitoData.titulo,
        descripcion: hitoData.descripcion,
        categoria: hitoData.categoria,
        completado: hitoData.completado,
        fechaRegistro: hitoData.fechaRegistro,
        eventoId: Number(hitoData.eventoId),
      };

      console.log("Hito a guardar:", hitoToSave);
      
      // Determinar si estamos creando o actualizando
      if (isEditing) {
        await updateHito({ ...hitoToSave, id: hitoId! });
        setSuccess("Hito actualizado exitosamente");
      } else {
        await createHito(hitoToSave.eventoId, hitoToSave);
        setSuccess("Hito creado exitosamente");
      }

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
    <div className="hito-form-wrapper">
      <h3 className="hito-form-title">{isEditing ? 'Editar Hito' : 'Crear Hito'}</h3>

      {error && <div className="hito-form-error">{error}</div>}
      {success && <div className="hito-form-success">{success}</div>}
      {loading && <div className="hito-form-success">Cargando...</div>}

      <form onSubmit={handleSubmit} className="hito-form">
        {/* Evento Asociado */}
        <div className="hito-form-group">
          <label htmlFor="eventoId" className="hito-form-label">Evento Asociado:</label>
          <select
            id="eventoId"
            name="eventoId"
            value={hitoData.eventoId || ''}
            onChange={handleChange}
            className="hito-form-input"
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
        <div className="hito-form-group">
          <label htmlFor="titulo" className="hito-form-label">Título del Hito:</label>
          <input
            type="text"
            id="titulo"
            name="titulo"
            value={hitoData.titulo || ''}
            onChange={handleChange}
            className="hito-form-input"
            required
          />
        </div>

        {/* Descripción */}
        <div className="hito-form-group">
          <label htmlFor="descripcion" className="hito-form-label">Descripción:</label>
          <textarea
            id="descripcion"
            name="descripcion"
            value={hitoData.descripcion || ''}
            onChange={handleChange}
            className="hito-form-input"
            rows={4}
            required
          />
        </div>

        {/* Categoría */}
        <div className="hito-form-group">
          <label htmlFor="categoria" className="hito-form-label">Categoría:</label>
          <select
            id="categoria"
            name="categoria"
            value={hitoData.categoria || ''}
            onChange={handleChange}
            className="hito-form-input"
            required
          >
            <option value="">Selecciona una categoría</option>
            <option value="LOGRO">Logro</option>
            <option value="META">Meta</option>
            <option value="OTRO">Otro</option>
          </select>
        </div>

        {/* Usuario Ganador */}
        <div className="hito-form-group">
          <label htmlFor="usuarioGanadorId" className="hito-form-label">Usuario Ganador:</label>
          <select
            id="usuarioGanadorId"
            name="usuarioGanadorId"
            value={usuarioGanadorId}
            onChange={(e) => setUsuarioGanadorId(e.target.value ? Number(e.target.value) : '')}
            className="hito-form-input"
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
        <div className="hito-form-actions">
          <button 
            type="button" 
            onClick={onCancel}
            className="hitoform-btn hitoform-btn-secondary"
          >
            Cancelar
          </button>
          <button 
            type="submit"
            className="hitoform-btn"
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