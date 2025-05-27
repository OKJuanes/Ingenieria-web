// src/components/admin/EventoForm.tsx
import React, { useState, useEffect } from 'react';
import { Evento } from '../../services/eventoService'; // Asegúrate de importar la interfaz Evento

interface EventoFormProps {
  evento: Evento | null; // El evento a editar. Null si fuera para crear, pero aquí siempre será edición.
  onSave: (evento: Evento) => void;
  onCancel: () => void;
}

const EventoForm: React.FC<EventoFormProps> = ({ evento, onSave, onCancel }) => {
  // Inicializa formData con los datos del evento prop, o con valores predeterminados si es null (no debería pasar aquí)
  const [formData, setFormData] = useState<Evento | null>(evento);

  // Actualiza formData si el 'evento' prop cambia (ej. cuando se selecciona otro evento para editar)
  useEffect(() => {
    setFormData(evento);
  }, [evento]);

  // Si formData es null en este punto, algo salió mal o no hay evento para editar.
  // Podrías mostrar un spinner o un mensaje de error, o simplemente no renderizar.
  if (!formData) {
    return <p className="text-gray-600">Cargando formulario de evento...</p>;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    // Manejo especial para números y arrays de strings
    if (name === 'cantidadParticipantes') {
      setFormData(prev => prev ? { ...prev, [name]: parseInt(value) || 0 } : null);
    } else if (name === 'invitadosExternos' || name === 'invitados') {
        // Asume que los invitados se ingresan como una cadena separada por comas
        const arrayValue = value.split(',').map(item => item.trim()).filter(item => item !== '');
        setFormData(prev => prev ? { ...prev, [name]: arrayValue } : null);
    } else {
      setFormData(prev => prev ? { ...prev, [name]: value } : null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData) {
      onSave(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
      <div className="mb-4">
        <label htmlFor="nombre" className="block text-gray-700 text-sm font-bold mb-2">
          Nombre del evento:
        </label>
        <input
          type="text"
          id="nombre"
          name="nombre"
          value={formData.nombre}
          onChange={handleChange}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          required
        />
      </div>
      <div className="mb-4">
        <label htmlFor="tipo" className="block text-gray-700 text-sm font-bold mb-2">
          Tipo de evento:
        </label>
        <input
          type="text"
          id="tipo"
          name="tipo"
          value={formData.tipo}
          onChange={handleChange}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          required
        />
      </div>
      <div className="mb-4">
        <label htmlFor="fecha" className="block text-gray-700 text-sm font-bold mb-2">
          Fecha:
        </label>
        <input
          type="date"
          id="fecha"
          name="fecha"
          value={formData.fecha ? formData.fecha.split('T')[0] : ''}
          onChange={handleChange}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          required
        />
      </div>
      <div className="mb-4">
        <label htmlFor="descripcion" className="block text-gray-700 text-sm font-bold mb-2">
          Descripción:
        </label>
        <textarea
          id="descripcion"
          name="descripcion"
          value={formData.descripcion}
          onChange={handleChange}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-24"
          required
        />
      </div>
      <div className="mb-4">
        <label htmlFor="cantidadParticipantes" className="block text-gray-700 text-sm font-bold mb-2">
          Cantidad de participantes:
        </label>
        <input
          type="number"
          id="cantidadParticipantes"
          name="cantidadParticipantes"
          value={formData.cantidadParticipantes || ''}
          onChange={handleChange}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        />
      </div>
      <div className="mb-4">
        <label htmlFor="empresaPatrocinadora" className="block text-gray-700 text-sm font-bold mb-2">
          Empresa patrocinadora:
        </label>
        <input
          type="text"
          id="empresaPatrocinadora"
          name="empresaPatrocinadora"
          value={formData.empresa || ''}
          onChange={handleChange}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        />
      </div>
      <div className="mb-4">
        <label htmlFor="invitadosExternos" className="block text-gray-700 text-sm font-bold mb-2">
          Invitados externos (separados por coma):
        </label>
        <input
          type="text"
          id="invitadosExternos"
          name="invitadosExternos"
          value={formData.invitadosExternos?.join(', ') || ''}
          onChange={handleChange}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        />
      </div>
      <div className="mb-6">
        <label htmlFor="invitados" className="block text-gray-700 text-sm font-bold mb-2">
          Invitados (IDs de usuarios, separados por coma):
        </label>
        <input
          type="text"
          id="invitados"
          name="invitados"
          value={formData.invitados?.join(', ') || ''}
          onChange={handleChange}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        />
      </div>
      <div className="flex items-center justify-between">
        <button
          type="submit"
          className="bg-violet-700 hover:bg-violet-800 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-300"
        >
          Guardar cambios
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-300"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
};

export default EventoForm;