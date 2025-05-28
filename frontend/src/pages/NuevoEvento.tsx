// src/pages/NuevoEvento.tsx
import React, { useState, useEffect } from 'react';
import Navbar from '../components/common/Navbar';
import { useNavigate, useParams } from 'react-router-dom';
import { Evento, createEvent, getEventoById, updateEvent } from '../services/eventoService'; // Importa las funciones
import '../assets/styles/NuevoEvento.css'; // Asegúrate de tener este CSS
import {jwtDecode} from 'jwt-decode'; // Asegúrate de tener instalada esta dependencia

const NuevoEvento: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>(); // Obtener el ID de la URL si estamos en modo edición
  const isEditing = !!id; // True si el ID existe (modo edición)
  console.log("NuevoEvento.tsx: id from useParams:", id);
  console.log("NuevoEvento.tsx: isEditing:", isEditing);
  const [eventoData, setEventoData] = useState<Evento>({
    id: 0, // El ID se generará o se usará el existente
    nombre: '',
    tipo: '',
    fecha: '',
    descripcion: '',
    empresa: '',
    invitadosExternos: [],
    invitados: [], // Para los usuarios registrados
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Efecto para cargar los datos del evento si estamos en modo edición
  useEffect(() => {
    if (isEditing) {
      const fetchEvento = async () => {
        setLoading(true);
        setError(null);
        try {
          const evento = await getEventoById(parseInt(id!)); // Parsear ID a número
          if (evento) {
            setEventoData(evento);
          } else {
            setError('Evento no encontrado.');
            navigate('/home-admin'); // Redirigir si el evento no existe
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
      [name]: name === 'cantidadParticipantes' ? parseInt(value) || 0 : value, // Convertir a número si es cantidadParticipantes
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
        // Modo Edición
        const updated = await updateEvent(eventoData);
        setSuccess(`Evento "${updated.nombre}" actualizado exitosamente.`);
        setTimeout(() => navigate('/home-admin'), 2000); // Volver al panel admin después de 2 segundos
      } else {
        // Modo Creación
        const newEvent = await createEvent(eventoData);
        setSuccess(`Evento "${newEvent.nombre}" creado exitosamente con ID: ${newEvent.id}.`);
        setEventoData({ // Limpiar el formulario después de crear
          id: 0,
          nombre: '',
          tipo: '',
          fecha: '',
          descripcion: '',
          empresa: '',
          invitadosExternos: [],
          invitados: [],
        });
        setTimeout(() => navigate('/home-admin'), 2000); // Volver al panel admin después de 2 segundos
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
    <div className="nuevo-evento-bg">
      <Navbar />
      <div className="nuevo-evento-container">
        

        {error && <div className="bg-red-200 text-red-800 p-3 rounded mb-4">{error}</div>}
        {success && <div className="bg-green-200 text-green-800 p-3 rounded mb-4">{success}</div>}

        <form onSubmit={handleSubmit} className="form-container">
          <div className="form-group">
            <label htmlFor="nombre" className="block text-gray-700 text-sm font-bold mb-2">Nombre del Evento:</label>
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

          <div className="form-group">
            <label htmlFor="tipo" className="block text-gray-700 text-sm font-bold mb-2">Tipo de Evento:</label>
            <select
              id="tipo"
              name="tipo"
              value={eventoData.tipo}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            >
              <option value="">Selecciona un tipo</option>
              <option value="BOOTCAMP">BOOTCAMP</option>
              <option value="HACKATON">HACKATON</option>
              <option value="CHARLA">CHARLA</option>
              <option value="CONCURSO">CONCURSO</option>
              <option value="OTROS">OTROS</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="fecha" className="block text-gray-700 text-sm font-bold mb-2">Fecha:</label>
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

          <div className="form-group">
            <label htmlFor="descripcion" className="block text-gray-700 text-sm font-bold mb-2">Descripción:</label>
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

          <div className="form-group">
            <label htmlFor="empresa" className="block text-gray-700 text-sm font-bold mb-2">Empresa Patrocinadora:</label>
            <input
              type="text"
              id="empresa"
              name="empresa"
              value={eventoData.empresa || ''}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>

          {/* <div className="mb-4">
            <label htmlFor="invitadosExternos" className="block text-gray-700 text-sm font-bold mb-2">Invitados Externos (separados por comas):</label>
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
                    // Importa jwtDecode o ajusta según tu implementación
                    const decoded = jwtDecode<{ role?: string; authorities?: string }>(token);

                    alert(`Rol: ${decoded.role}\nPermisos: ${decoded.authorities || 'No disponible'}`);
                  } catch (e) {
                    console.error("Error decodificando token:", e);
                    alert("Error al decodificar token. Ver consola.");
                  }
                } else {
                  alert("No hay token guardado");
                }
              }}
              className="verificar-permisos-btn"
            >
              Verificar permisos
            </button>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={() => navigate('/home-admin')}
              className="eventoform-btn eventoform-btn-secondary"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="eventoform-btn"
              disabled={loading}
            >
              {loading ? 'Guardando...' : (isEditing ? 'Actualizar Evento' : 'Crear Evento')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NuevoEvento;