// src/pages/NuevoEvento.tsx
import React, { useState, useEffect } from 'react';
import Navbar from '../components/common/Navbar';
import { useNavigate, useParams } from 'react-router-dom';
import { Evento, createEvent, getEventoById, updateEvent } from '../services/eventoService';
import '../assets/styles/NuevoEvento.css';
import { jwtDecode } from 'jwt-decode';
import '../assets/styles/global.css';

const NuevoEvento: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;

  const [eventoData, setEventoData] = useState<Evento>({
    id: 0,
    nombre: '',
    tipo: '',
    fecha: '',
    descripcion: '',
    empresa: '',
    invitadosExternos: [],
    invitados: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (isEditing) {
      const fetchEvento = async () => {
        setLoading(true);
        setError(null);
        try {
          const evento = await getEventoById(parseInt(id!));
          if (evento) {
            setEventoData(evento);
          } else {
            setError('Evento no encontrado.');
            navigate('/home-admin');
          }
        } catch (err: any) {
          setError(err.message || 'Error al cargar el evento para edición.');
          console.error("Error fetching event for edit:", err);
        } finally {
          setLoading(false);
        }
      };
      fetchEvento();
    }
  }, [id, isEditing, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEventoData(prevData => ({
      ...prevData,
      [name]: name === 'cantidadParticipantes' ? parseInt(value) || 0 : value,
    }));
  };

  const handleArrayChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, field: keyof Evento) => {
    const { value } = e.target;
    const items = value.split(',').map(item => item.trim()).filter(item => item !== '');
    setEventoData(prevData => ({
      ...prevData,
      [field]: items,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (isEditing) {
        const updated = await updateEvent(eventoData);
        setSuccess(`Evento "${updated.nombre}" actualizado exitosamente.`);
        setTimeout(() => navigate('/home-admin'), 2000);
      } else {
        const newEvent = await createEvent(eventoData);
        setSuccess(`Evento "${newEvent.nombre}" creado exitosamente.`);
        setEventoData({
          id: 0,
          nombre: '',
          tipo: '',
          fecha: '',
          descripcion: '',
          empresa: '',
          invitadosExternos: [],
          invitados: [],
        });
        setTimeout(() => navigate('/home-admin'), 2000);
      }
    } catch (err: any) {
      setError(err.message || 'Error al guardar el evento.');
      console.error("Error saving event:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditing) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-purple-400 to-indigo-600 flex items-center justify-center">
        <p className="text-white text-2xl">Cargando datos del evento...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-400 to-indigo-600">
      <Navbar />
      <div className="container mx-auto p-4">
        <h2 className="text-4xl font-bold text-white mb-6">
          {isEditing ? 'Editar Evento' : 'Crear Nuevo Evento'}
        </h2>

        {error && <div className="bg-red-200 text-red-800 p-3 rounded mb-4">{error}</div>}
        {success && <div className="bg-green-200 text-green-800 p-3 rounded mb-4">{success}</div>}

        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md max-w-2xl mx-auto">
          <div className="mb-4">
            <label htmlFor="nombre" className="block text-gray-700 text-sm font-bold mb-2">
              Nombre del evento:
            </label>
            <input
              type="text"
              id="nombre"
              name="nombre"
              value={eventoData.nombre}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="tipo" className="block text-gray-700 text-sm font-bold mb-2">
              Tipo de evento:
            </label>
            <select
              id="tipo"
              name="tipo"
              value={eventoData.tipo}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            >
              <option value="">Selecciona un tipo</option>
              <option value="BOOTCAMP">Bootcamp</option>
              <option value="HACKATON">Hackatón</option>
              <option value="CHARLA">Charla</option>
              <option value="CONCURSO">Concurso</option>
              <option value="OTROS">Otros</option>
            </select>
          </div>

          <div className="mb-4">
            <label htmlFor="fecha" className="block text-gray-700 text-sm font-bold mb-2">
              Fecha:
            </label>
            <input
              type="date"
              id="fecha"
              name="fecha"
              value={eventoData.fecha}
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
              value={eventoData.descripcion}
              onChange={handleChange}
              rows={4}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            ></textarea>
          </div>

          <div className="mb-4">
            <label htmlFor="empresa" className="block text-gray-700 text-sm font-bold mb-2">
              Empresa patrocinadora:
            </label>
            <input
              type="text"
              id="empresa"
              name="empresa"
              value={eventoData.empresa || ''}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>

          {/* Si quieres permitir invitados externos, descomenta esto */}
          {/* <div className="mb-4">
            <label htmlFor="invitadosExternos" className="block text-gray-700 text-sm font-bold mb-2">
              Invitados externos (separados por comas):
            </label>
            <input
              type="text"
              id="invitadosExternos"
              name="invitadosExternos"
              value={eventoData.invitadosExternos?.join(', ') || ''}
              onChange={(e) => handleArrayChange(e, 'invitadosExternos')}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Ej: Juan Perez (Speaker), Maria Lopez (Keynote)"
            />
          </div> */}

          <div className="mb-4">
            <button
              type="button"
              onClick={() => {
                const token = localStorage.getItem('authToken');
                if (token) {
                  try {
                    const decoded = jwtDecode<{ role?: string; authorities?: string }>(token);
                    alert(`Rol: ${decoded.role}\nPermisos: ${decoded.authorities || 'No disponible'}`);
                  } catch (e) {
                    alert("Error al decodificar token. Ver consola.");
                  }
                } else {
                  alert("No hay token guardado");
                }
              }}
              className="text-sm text-gray-600 mb-2"
            >
              Verificar permisos
            </button>
          </div>

          <button
            type="submit"
            className="bg-violet-700 hover:bg-violet-800 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            disabled={loading}
          >
            {loading ? 'Guardando...' : (isEditing ? 'Actualizar evento' : 'Crear evento')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default NuevoEvento;