// src/pages/HomeUsuario.tsx
import React, { useState, useEffect } from 'react'; // Importa useEffect
import Navbar from '../components/common/Navbar';
import { Evento, getEventos } from '../services/eventoService'; // Importa Evento y getEventos
import '../assets/styles/HomeUsuario.css';

const HomeUsuario: React.FC = () => {
  const [eventos, setEventos] = useState<Evento[]>([]); // Estado para los eventos, tipado con Evento[]
  const [loading, setLoading] = useState(true); // Estado para controlar la carga
  const [error, setError] = useState<string | null>(null); // Estado para manejar errores
  const [etiquetasSeleccionadas, setEtiquetasSeleccionadas] = useState<string[]>([]);

  // useEffect para cargar los eventos del backend al montar el componente
  useEffect(() => {
    const fetchEventos = async () => {
      try {
        setLoading(true);
        setError(null);
        const fetchedEventos = await getEventos(); // Llama a la función del servicio
        setEventos(fetchedEventos);
      } catch (err: any) {
        setError(err.message || 'Error al cargar los eventos.');
        console.error("Error fetching events for HomeUsuario:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEventos();
  }, []); // El array vacío asegura que se ejecute solo una vez al montar

  const handleEtiquetaClick = (etiqueta: string) => {
    if (etiquetasSeleccionadas.includes(etiqueta)) {
      setEtiquetasSeleccionadas(etiquetasSeleccionadas.filter((e) => e !== etiqueta));
    } else {
      setEtiquetasSeleccionadas([...etiquetasSeleccionadas, etiqueta]);
    }
  };

  // Filtrar eventos según las etiquetas seleccionadas
  // Asumiendo que `evento.tipo` es un campo de la interfaz Evento que usas para el filtro
  const eventosFiltrados = eventos.filter((evento) =>
    etiquetasSeleccionadas.length === 0 || etiquetasSeleccionadas.includes(evento.tipo)
  );

  return (
    <div className="home-usuario-container">
      <Navbar />
      <div className="home-usuario-content">
        <h2 className="home-usuario-title">Bienvenido, Usuario</h2>

        {/* Filtro de etiquetas */}
        <div className="filtro-etiquetas">
          <h3>Filtrar por tipo de evento:</h3>
          <div className="filtro-etiquetas-botones">
            {/* Si los tipos de evento vienen del backend, puedes generar dinámicamente estos botones
                Por ahora, se mantienen los tipos hardcodeados para el ejemplo.
                Deberías obtener la lista de tipos únicos de tus `eventos` una vez cargados. */}
            {['Tecnología', 'Inteligencia Artificial', 'Programación', 'Deporte', 'Cultura', 'Social'].map((etiqueta) => (
              <button
                key={etiqueta}
                onClick={() => handleEtiquetaClick(etiqueta)}
                className={etiquetasSeleccionadas.includes(etiqueta) ? 'active' : 'inactive'}
              >
                {etiqueta}
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
                  <p><strong>Participantes:</strong> {evento.cantidadParticipantes}</p>
                  <p><strong>Patrocinador:</strong> {evento.empresaPatrocinadora}</p>
                  {/* Asegúrate que `invitadosExternos` e `invitados` sean arrays en tu interfaz Evento */}
                  {evento.invitadosExternos && evento.invitadosExternos.length > 0 && (
                    <div>
                      <p><strong>Invitados Externos:</strong></p>
                      <ul className="lista-invitados">
                        {evento.invitadosExternos.map((invitado, index) => (
                          <li key={index}>{invitado}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {evento.invitados && evento.invitados.length > 0 && (
                    <div>
                      <p><strong>Invitados:</strong></p>
                      <ul className="lista-invitados">
                        {evento.invitados.map((invitado, index) => (
                          <li key={index}>{invitado}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mensaje-sin-eventos">No hay eventos que coincidan con los filtros seleccionados.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomeUsuario;