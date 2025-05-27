// src/pages/HomeUsuario.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import { getEventos, Evento } from '../services/eventoService';
import '../assets/styles/HomeUsuario.css';
import '../assets/styles/global.css';

const HomeUsuario: React.FC = () => {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [etiquetasSeleccionadas, setEtiquetasSeleccionadas] = useState<string[]>([]);

  useEffect(() => {
    const fetchEventos = async () => {
      try {
        setLoading(true);
        const fetchedEventos = await getEventos();
        setEventos(fetchedEventos);
      } catch (err: any) {
        setError(err.message || 'Error al cargar los eventos.');
      } finally {
        setLoading(false);
      }
    };

    fetchEventos();
  }, []);

  const handleEtiquetaClick = (etiqueta: string) => {
    setEtiquetasSeleccionadas(prev =>
      prev.includes(etiqueta)
        ? prev.filter(e => e !== etiqueta)
        : [...prev, etiqueta]
    );
  };

  // Extraer tipos de eventos únicos para los filtros
  const tiposDeEvento = [...new Set(eventos.map(e => e.tipo))];

  // Filtrar eventos según etiquetas seleccionadas
  const eventosFiltrados = eventos.filter(evento =>
    etiquetasSeleccionadas.length === 0 || etiquetasSeleccionadas.includes(evento.tipo)
  );

  return (
    <div className="home-usuario-container min-h-screen bg-gradient-to-r from-purple-400 to-indigo-600">
      <Navbar />
      <div className="home-usuario-content container mx-auto p-4">
        <h2 className="text-4xl font-bold text-white mb-6">Bienvenido</h2>

        {/* Filtro por tipos */}
        <div className="filtro-etiquetas mb-8">
          <h3 className="text-xl font-semibold text-white mb-2">Filtrar por tipo de evento:</h3>
          <div className="filtro-etiquetas-botones flex flex-wrap gap-2">
            {tiposDeEvento.map(tipo => (
              <button
                key={tipo}
                onClick={() => handleEtiquetaClick(tipo)}
                className={`py-1 px-4 rounded font-semibold transition ${
                  etiquetasSeleccionadas.includes(tipo)
                    ? 'bg-violet-700 text-white'
                    : 'bg-white text-violet-700 border border-violet-700'
                }`}
              >
                {tipo}
              </button>
            ))}
          </div>
        </div>

        {/* Lista de eventos */}
        <div className="lista-eventos bg-white rounded-lg shadow-md p-6">
          <h3 className="text-2xl font-bold text-violet-700 mb-4">Eventos Disponibles</h3>
          {loading ? (
            <p className="mensaje-carga text-gray-700 text-lg">Cargando eventos...</p>
          ) : error ? (
            <p className="mensaje-error text-red-500 text-lg">Error: {error}</p>
          ) : eventosFiltrados.length > 0 ? (
            <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {eventosFiltrados.map((evento) => (
                <li key={evento.id} className="evento-item bg-gray-50 rounded-lg p-4 shadow hover:shadow-lg transition">
                  <h4 className="text-xl font-semibold text-violet-800 mb-2">{evento.nombre}</h4>
                  <p className="text-gray-700 mb-1"><strong>Fecha:</strong> {evento.fecha}</p>
                  <p className="text-gray-700 mb-1"><strong>Tipo:</strong> {evento.tipo}</p>
                  <p className="text-gray-700 mb-1"><strong>Patrocinador:</strong> {evento.empresa || 'No especificado'}</p>
                  <p className="text-gray-700 mb-2"><strong>Descripción:</strong> {evento.descripcion}</p>
                  <Link to={`/eventos/${evento.id}`} className="btn-ver-detalle bg-violet-700 hover:bg-violet-800 text-white font-bold py-2 px-4 rounded transition">
                    Ver detalles
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mensaje-sin-eventos text-gray-700 text-lg">No hay eventos disponibles en este momento.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomeUsuario;