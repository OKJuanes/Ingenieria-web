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
  const [searchTerm, setSearchTerm] = useState('');

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
  
  // Filtrar eventos según etiquetas y búsqueda
  const eventosFiltrados = eventos.filter(evento =>
    (etiquetasSeleccionadas.length === 0 || etiquetasSeleccionadas.includes(evento.tipo)) &&
    (searchTerm === '' || 
     evento.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
     evento.descripcion.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="home-usuario-container">
      <Navbar />
      <div className="home-usuario-content">
        <h2 className="home-usuario-title">Bienvenido</h2>
        
        {/* Barra de búsqueda */}
        <div className="search-bar">
          <input
            type="text"
            placeholder="Buscar eventos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        
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
            <div className="eventos-grid">
              {eventosFiltrados.map((evento) => (
                <div key={evento.id} className="evento-card">
                  <h4>{evento.nombre}</h4>
                  <div className="evento-fecha">{evento.fecha}</div>
                  <div className="evento-tipo">{evento.tipo}</div>
                  <p className="evento-patrocinador">
                    <strong>Patrocinador:</strong> {evento.empresa || 'No especificado'}
                  </p>
                  <p className="evento-descripcion">{evento.descripcion}</p>
                  <Link to={`/eventos/${evento.id}`} className="evento-btn">
                    Ver detalles
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <p className="mensaje-sin-eventos">No hay eventos disponibles con los criterios seleccionados.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomeUsuario;