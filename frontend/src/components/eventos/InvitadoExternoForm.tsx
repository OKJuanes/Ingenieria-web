import React, { useState } from 'react';
import { addExternalGuest } from '../../services/eventoService';

interface InvitadoExternoFormProps {
  eventoId: number;
  onClose: () => void;
  onSuccess: () => void;
}

const InvitadoExternoForm: React.FC<InvitadoExternoFormProps> = ({ 
  eventoId, 
  onClose,
  onSuccess
}) => {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    correo: '',
    telefono: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validaciones básicas
      if (!formData.nombre.trim()) {
        throw new Error('El nombre es obligatorio');
      }
      
      if (!formData.correo.trim()) {
        throw new Error('El correo electrónico es obligatorio');
      }

      await addExternalGuest(eventoId, formData);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="nombre">
          Nombre *
        </label>
        <input
          type="text"
          id="nombre"
          name="nombre"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
          value={formData.nombre}
          onChange={handleChange}
          required
        />
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="apellido">
          Apellido
        </label>
        <input
          type="text"
          id="apellido"
          name="apellido"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
          value={formData.apellido}
          onChange={handleChange}
        />
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="correo">
          Correo *
        </label>
        <input
          type="email"
          id="correo"
          name="correo"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
          value={formData.correo}
          onChange={handleChange}
          required
        />
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="telefono">
          Teléfono
        </label>
        <input
          type="tel"
          id="telefono"
          name="telefono"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
          value={formData.telefono}
          onChange={handleChange}
        />
      </div>

      <div className="flex justify-end mt-4">
        <button
          type="button"
          onClick={onClose}
          className="mr-2 px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded hover:bg-gray-100"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="evento-btn"
          disabled={loading}
        >
          {loading ? 'Guardando...' : 'Añadir Invitado'}
        </button>
      </div>
    </form>
  );
};

export default InvitadoExternoForm;