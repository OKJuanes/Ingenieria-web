import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import { getEventoById, updateEvent, Evento } from '../services/eventoService';
import '../assets/styles/NuevoEvento.css';

const EditarEvento: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [eventoData, setEventoData] = useState<Evento>({
    id: 0,
    nombre: '',
    descripcion: '',
    tipo: '',
    fecha: '',
    empresa: ''
  });

  useEffect(() => {
    const fetchEvento = async () => {
      setLoading(true);
      setError(null);
      try {
        if (!id) {
          throw new Error('ID de evento no válido.');
        }
        
        const eventoId = parseInt(id, 10);
        const evento = await getEventoById(eventoId);
        
        if (evento) {
          setEventoData(evento);
        } else {
          setError('Evento no encontrado.');
        }
      } catch (err: any) {
        setError(err.message || 'Error al cargar los datos del evento');
        console.error('Error fetching evento:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchEvento();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEventoData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setLoading(true);
    setError(null);
    
    try {
      // Solo enviamos los campos permitidos para actualizar
      await updateEvent(eventoData);
      setSuccess('Evento actualizado exitosamente');
      setTimeout(() => navigate('/home-admin'), 1500);
    } catch (err: any) {
      setError(err.message || 'Error al actualizar el evento');
      console.error('Error updating evento:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-400 to-indigo-600">
      <Navbar />
      <div className="container mx-auto p-4">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-6 text-center">Editar Evento</h2>
          
          {error && <div className="bg-red-200 text-red-800 p-3 rounded mb-4">{error}</div>}
          {success && <div className="bg-green-200 text-green-800 p-3 rounded mb-4">{success}</div>}
          
          {loading ? (
            <div className="bg-white p-6 rounded-lg shadow-md flex justify-center">
              <p className="text-gray-700">Cargando datos del evento...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
              <div className="mb-4">
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
              
              <div className="mb-4">
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
              
              <div className="mb-4">
                <label htmlFor="fecha" className="block text-gray-700 text-sm font-bold mb-2">Fecha:</label>
                <input
                  type="date"
                  id="fecha"
                  name="fecha"
                  value={eventoData.fecha ? eventoData.fecha.split('T')[0] : ''}
                  onChange={handleChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                />
              </div>
              
              <div className="mb-4">
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
              
              <div className="mb-6">
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
              
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => navigate('/home-admin')}
                  className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  disabled={loading}
                >
                  {loading ? 'Guardando...' : 'Actualizar Evento'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditarEvento;