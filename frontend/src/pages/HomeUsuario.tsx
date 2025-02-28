// src/pages/HomeUsuario.tsx
import React, { useState } from 'react';
import Navbar from '../components/common/Navbar';
import '../assets/styles/HomeUsuario.css';

const HomeUsuario: React.FC = () => {
  // Datos de ejemplo para los eventos
  const [eventos, setEventos] = useState([
    {
      id: 1,
      nombre: 'Hackathon 2023',
      tipo: 'Tecnología',
      fecha: '2023-10-15',
      cantidadParticipantes: 150,
      empresaPatrocinadora: 'TechCorp',
      invitadosExternos: ['Juan Pérez', 'María Gómez'],
      invitados: ['Ana López', 'Carlos Ruiz'],
    },
    {
      id: 2,
      nombre: 'Conferencia de IA',
      tipo: 'Inteligencia Artificial',
      fecha: '2023-11-20',
      cantidadParticipantes: 200,
      empresaPatrocinadora: 'AI Solutions',
      invitadosExternos: ['Laura Díaz', 'Pedro Martínez'],
      invitados: ['Sofía García', 'Miguel Torres'],
    },
    {
      id: 3,
      nombre: 'Bootcamp de Desarrollo Web',
      tipo: 'Programación',
      fecha: '2023-12-05',
      cantidadParticipantes: 100,
      empresaPatrocinadora: 'Code Academy',
      invitadosExternos: ['Elena Ramírez', 'Jorge Fernández'],
      invitados: ['Lucía Sánchez', 'Diego Morales'],
    },
  ]);

  // Estado para las etiquetas seleccionadas
  const [etiquetasSeleccionadas, setEtiquetasSeleccionadas] = useState<string[]>([]);

  // Función para manejar la selección de etiquetas
  const handleEtiquetaClick = (etiqueta: string) => {
    if (etiquetasSeleccionadas.includes(etiqueta)) {
      setEtiquetasSeleccionadas(etiquetasSeleccionadas.filter((e) => e !== etiqueta));
    } else {
      setEtiquetasSeleccionadas([...etiquetasSeleccionadas, etiqueta]);
    }
  };

  // Filtrar eventos según las etiquetas seleccionadas
  const eventosFiltrados = eventos.filter((evento) =>
    etiquetasSeleccionadas.length === 0 || etiquetasSeleccionadas.includes(evento.tipo)
  );

  return (
    <div className="home-usuario-container">
      <Navbar /> {/* Navbar fija en la parte superior */}
      <div className="home-usuario-content">
        <h2 className="home-usuario-title">Bienvenido, Usuario</h2>

        {/* Filtro de etiquetas */}
        <div className="filtro-etiquetas">
          <h3>Filtrar por tipo de evento:</h3>
          <div className="filtro-etiquetas-botones">
            {['Tecnología', 'Inteligencia Artificial', 'Programación'].map((etiqueta) => (
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
          {eventosFiltrados.length > 0 ? (
            <ul>
              {eventosFiltrados.map((evento) => (
                <li key={evento.id} className="evento-item">
                  <h4>{evento.nombre}</h4>
                  <p><strong>Fecha:</strong> {evento.fecha}</p>
                  <p><strong>Tipo:</strong> {evento.tipo}</p>
                  <p><strong>Participantes:</strong> {evento.cantidadParticipantes}</p>
                  <p><strong>Patrocinador:</strong> {evento.empresaPatrocinadora}</p>
                  <div>
                    <p><strong>Invitados Externos:</strong></p>
                    <ul className="lista-invitados">
                      {evento.invitadosExternos.map((invitado, index) => (
                        <li key={index}>{invitado}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p><strong>Invitados:</strong></p>
                    <ul className="lista-invitados">
                      {evento.invitados.map((invitado, index) => (
                        <li key={index}>{invitado}</li>
                      ))}
                    </ul>
                  </div>
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