import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import EventoForm from '../components/eventos/EventoForm';
import { getEventoById, updateEvent, Evento } from '../services/eventoService';
import '../assets/styles/global.css';

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-purple-400 to-indigo-600 flex items-center justify-center">
        <p className="text-white text-2xl">Cargando datos del evento...</p>
      </div>
    );
  }

  if (error || !evento) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-purple-400 to-indigo-600 flex items-center justify-center">
        <p className="text-red-300 text-2xl">{error || 'Evento no encontrado.'}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-400 to-indigo-600">
      <Navbar />
      <div className="container mx-auto p-4">
        <h2 className="text-4xl font-bold text-white mb-6">Editar Evento</h2>
        <EventoForm evento={evento} onSave={handleSave} onCancel={handleCancel} />
      </div>
    </div>
  );
};

export default EditarEvento;