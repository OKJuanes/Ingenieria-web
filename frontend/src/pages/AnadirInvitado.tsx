import React, { useState, useEffect } from 'react';
import Navbar from '../components/common/Navbar';
import { getEventos, Evento, addExternalGuest } from '../services/eventoService';
import '../assets/styles/AnadirInvitado.css';
import { toast } from 'react-toastify';

const initialInvitado = {
  nombre: '',
  apellido: '',
  correo: '',
  empresa: '',
  telefono: '',
};

const AnadirInvitado: React.FC = () => {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [filtro, setFiltro] = useState('');
  const [eventoSeleccionado, setEventoSeleccionado] = useState<Evento | null>(null);
  const [invitado, setInvitado] = useState(initialInvitado);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  useEffect(() => {
    const fetchEventos = async () => {
      const data = await getEventos();
      setEventos(data);
    };
    fetchEventos();
  }, []);

  const eventosFiltrados = eventos.filter(e =>
    e.nombre.toLowerCase().includes(filtro.toLowerCase())
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInvitado({ ...invitado, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (!eventoSeleccionado) {
      toast.error("Debes seleccionar un evento");
      setLoading(false);
      return;
    }

    try {
      // Preparar los datos para el invitado externo
      const externalGuestData = {
        nombre: invitado.nombre,
        apellido: invitado.apellido,
        correo: invitado.correo,
        telefono: invitado.telefono,
        empresa: invitado.empresa  // AÑADIR ESTA LÍNEA
      };
      
      // Llamar al servicio para añadir el invitado externo
      await addExternalGuest(eventoSeleccionado.id, externalGuestData);
      
      toast.success("Invitado añadido exitosamente");
      
      // Resetear el formulario
      setInvitado(initialInvitado);
      setEventoSeleccionado(null);
    } catch (err: any) {
      toast.error(`Error al añadir invitado: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="anadir-invitado-bg">
      <Navbar />
      <div className="anadir-invitado-container">
        <div className="anadir-invitado-form-wrapper">
          <h2 className="text-3xl font-bold text-violet-800 mb-6 text-center">Añadir Invitado Externo</h2>

          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 border border-red-300 rounded-md">
              <p>{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-100 text-green-700 border border-green-300 rounded-md">
              <p>{success}</p>
            </div>
          )}

          <div className="mb-4">
            <label className="block text-gray-700 font-semibold mb-2">Buscar Evento:</label>
            <input
              type="text"
              value={filtro}
              onChange={e => setFiltro(e.target.value)}
              placeholder="Escribe para filtrar eventos..."
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 font-semibold mb-2">Selecciona un Evento:</label>
            <select
              value={eventoSeleccionado?.id || ''}
              onChange={e => {
                const ev = eventos.find(ev => ev.id === Number(e.target.value));
                setEventoSeleccionado(ev || null);
              }}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            >
              <option value="">-- Selecciona --</option>
              {eventosFiltrados.map(ev => (
                <option key={ev.id} value={ev.id}>{ev.nombre}</option>
              ))}
            </select>
          </div>
          
          <form onSubmit={handleSubmit} className="anadir-invitado-form">
            <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 mb-1">Nombre:</label>
                <input type="text" name="nombre" value={invitado.nombre} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded" required />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Apellido:</label>
                <input type="text" name="apellido" value={invitado.apellido} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded" required />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Correo:</label>
                <input type="email" name="correo" value={invitado.correo} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded" required />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Empresa:</label>
                <input type="text" name="empresa" value={invitado.empresa} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded" required />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Teléfono:</label>
                <input type="text" name="telefono" value={invitado.telefono} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded" required />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button 
                type="submit" 
                disabled={loading} 
                className={`anadir-invitado-btn ${loading ? 'opacity-75 cursor-not-allowed' : ''}`}
              >
                {loading ? 'Añadiendo...' : 'Añadir Invitado'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AnadirInvitado;