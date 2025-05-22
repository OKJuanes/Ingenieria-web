// src/components/hitos/HitoForm.tsx
import React, { useState, useEffect } from 'react';
import { Hito, createHito, getHitoById, updateHito } from '../../services/hitoService';
import { Evento, getEventos } from '../../services/eventoService'; // Para obtener la lista de eventos
import '../../assets/styles/HitoForm.css'; // Asegúrate de crear este CSS

interface HitoFormProps {
  hitoId?: number; // Opcional: ID del hito a editar
  eventoIdParent?: number; // Opcional: ID del evento si se crea desde un evento específico
  onSave: () => void; // Callback para cuando se guarda un hito
  onCancel: () => void; // Callback para cancelar
}

const HitoForm: React.FC<HitoFormProps> = ({ hitoId, eventoIdParent, onSave, onCancel }) => {
  const isEditing = !!hitoId;

  const [hitoData, setHitoData] = useState<Hito>({
    id: 0,
    eventoId: eventoIdParent || 0, // Si viene de un evento, ya preselecciona el ID
    nombre: '',
    descripcion: '',
    fecha: '',
    completado: false,
  });
  const [eventos, setEventos] = useState<Evento[]>([]); // Para el select de eventos
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Cargar eventos para el selector
  useEffect(() => {
    const fetchEventos = async () => {
      try {
        const fetchedEventos = await getEventos();
        setEventos(fetchedEventos);
        // Si es un nuevo hito y no se predefinió el eventoId, selecciona el primero por defecto si hay
        if (!isEditing && !eventoIdParent && fetchedEventos.length > 0) {
            setHitoData(prev => ({ ...prev, eventoId: fetchedEventos[0].id }));
        }
      } catch (err: any) {
        console.error("Error cargando eventos para el formulario de hito:", err);
      }
    };
    fetchEventos();
  }, [isEditing, eventoIdParent]);

  // Cargar datos del hito si estamos editando
  useEffect(() => {
    if (isEditing) {
      const fetchHito = async () => {
        setLoading(true);
        setError(null);
        try {
          const hito = await getHitoById(hitoId!);
          if (hito) {
            setHitoData(hito);
          } else {
            setError('Hito no encontrado.');
          }
        } catch (err: any) {
          setError(err.message || 'Error al cargar el hito para edición.');
        } finally {
          setLoading(false);
        }
      };
      fetchHito();
    }
  }, [hitoId, isEditing]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    setHitoData(prevData => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (!hitoData.eventoId) { // Asegura que se haya seleccionado un evento
          throw new Error("Por favor, selecciona un evento al que asociar el hito.");
      }
      if (isEditing) {
        await updateHito(hitoData);
        setSuccess('Hito actualizado exitosamente.');
      } else {
        await createHito(hitoData);
        setSuccess('Hito creado exitosamente.');
        setHitoData({ // Resetear formulario para nuevo hito
          id: 0,
          eventoId: hitoData.eventoId, // Mantener el evento seleccionado
          nombre: '',
          descripcion: '',
          fecha: '',
          completado: false,
        });
      }
      setTimeout(() => onSave(), 1500); // Llamar a onSave para cerrar/actualizar
    } catch (err: any) {
      setError(err.message || 'Error al guardar el hito.');
      console.error("Error saving hito:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="hito-form-container bg-white p-6 rounded-lg shadow-md max-w-xl mx-auto my-4">
      <h3 className="text-2xl font-semibold text-gray-800 mb-4">{isEditing ? 'Editar Hito' : 'Crear Hito'}</h3>

      {error && <div className="bg-red-200 text-red-800 p-3 rounded mb-4">{error}</div>}
      {success && <div className="bg-green-200 text-green-800 p-3 rounded mb-4">{success}</div>}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="eventoId" className="block text-gray-700 text-sm font-bold mb-2">Evento Asociado:</label>
          <select
            id="eventoId"
            name="eventoId"
            value={hitoData.eventoId}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
            disabled={!!eventoIdParent && isEditing} // Deshabilitar si se pasó un eventoIdParent (ej. desde EventoView) y estamos editando
          >
            <option value="">Selecciona un evento</option>
            {eventos.map(evento => (
              <option key={evento.id} value={evento.id}>
                {evento.nombre} ({evento.fecha})
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label htmlFor="nombre" className="block text-gray-700 text-sm font-bold mb-2">Nombre del Hito:</label>
          <input
            type="text"
            id="nombre"
            name="nombre"
            value={hitoData.nombre}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>

        <div className="mb-4">
          <label htmlFor="descripcion" className="block text-gray-700 text-sm font-bold mb-2">Descripción (opcional):</label>
          <textarea
            id="descripcion"
            name="descripcion"
            value={hitoData.descripcion || ''}
            onChange={handleChange}
            rows={2}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          ></textarea>
        </div>

        <div className="mb-4">
          <label htmlFor="fecha" className="block text-gray-700 text-sm font-bold mb-2">Fecha del Hito:</label>
          <input
            type="date"
            id="fecha"
            name="fecha"
            value={hitoData.fecha}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>

        <div className="mb-4 flex items-center">
          <input
            type="checkbox"
            id="completado"
            name="completado"
            checked={hitoData.completado}
            onChange={handleChange}
            className="mr-2 h-4 w-4 text-violet-600 focus:ring-violet-500 border-gray-300 rounded"
          />
          <label htmlFor="completado" className="text-gray-700 text-sm font-bold">Completado</label>
        </div>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="bg-violet-700 hover:bg-violet-800 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            disabled={loading}
          >
            {loading ? 'Guardando...' : (isEditing ? 'Actualizar Hito' : 'Crear Hito')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default HitoForm;