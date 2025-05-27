// src/pages/HomeUsuario.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import { getEventos, Evento } from '../services/eventoService';
import '../assets/styles/HomeUsuario.css';

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
        console.log("Eventos cargados:", fetchedEventos);
        setEventos(fetchedEventos);
      } catch (err: any) {
        console.error("Error al cargar eventos:", err);
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
    <div className="home-usuario-container">
      <Navbar />
      <div className="home-usuario-content">
        <h2 className="home-usuario-title">Bienvenido</h2>
        
        {/* Filtro por tipos */}
        <div className="filtro-etiquetas">
          <h3>Filtrar por tipo de evento:</h3>
          <div className="filtro-etiquetas-botones">
            {tiposDeEvento.map(tipo => (
              <button
                key={tipo}
                onClick={() => handleEtiquetaClick(tipo)}
                className={etiquetasSeleccionadas.includes(tipo) ? 'active' : 'inactive'}
              >
                {tipo}
              </button>
            ))}
          </div>
        </div>

        {/* Lista de eventos */}
        <div className="lista-eventos">
          <h3>Eventos Disponibles</h3>
          {loading ? (
            <p className="mensaje-carga">Cargando eventos...</p>
          ) : error ? (
            <p className="mensaje-error">Error: {error}</p>
          ) : eventosFiltrados.length > 0 ? (
            <ul>
              {eventosFiltrados.map((evento) => (
                <li key={evento.id} className="evento-item">
                  <h4>{evento.nombre}</h4>
                  <p><strong>Fecha:</strong> {evento.fecha}</p>
                  <p><strong>Tipo:</strong> {evento.tipo}</p>
                  <p><strong>Patrocinador:</strong> {evento.empresa || 'No especificado'}</p>
                  <p><strong>Descripción:</strong> {evento.descripcion}</p>
                  <Link to={`/eventos/${evento.id}`} className="evento-btn btn-ver-detalle">
                    Ver detalles
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mensaje-sin-eventos">No hay eventos disponibles.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomeUsuario;