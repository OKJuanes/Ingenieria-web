import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import { getEventoById, updateEvent, Evento } from '../services/eventoService';
import EventoForm from '../components/eventos/EventoForm';
import '../assets/styles/NuevoEvento.css';

const EditarEvento: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [evento, setEvento] = useState<Evento | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvento = async () => {
      setLoading(true);
      setError(null);
      try {
        if (!id) throw new Error('ID de evento no válido.');
        const eventoData = await getEventoById(Number(id));
        if (eventoData) {
          setEvento(eventoData);
        } else {
          setError('Evento no encontrado.');
        }
      } catch (err: any) {
        setError(err.message || 'Error al cargar el evento.');
      } finally {
        setLoading(false);
      }
    };
    fetchEvento();
  }, [id]);

  const handleSave = async (formData: Evento) => {
    try {
      await updateEvent(formData);
      alert('Evento actualizado correctamente.');
      navigate('/home-admin');
    } catch (err: any) {
      alert(`Error al actualizar el evento: ${err.message}`);
    }
  };

  const handleCancel = () => {
    navigate('/home-admin');
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-400 to-indigo-600">
      <Navbar />
      <div className="container mx-auto p-4 flex flex-col items-center">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-2xl w-full mt-8">
          <h2 className="text-3xl font-bold text-violet-800 mb-6 text-center">Editar Evento</h2>
          {loading ? (
            <p className="text-gray-700 text-lg text-center">Cargando datos del evento...</p>
          ) : error ? (
            <p className="text-red-500 text-lg text-center">{error}</p>
          ) : evento ? (
            <EventoForm evento={evento} onSave={handleSave} onCancel={handleCancel} />
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default EditarEvento;