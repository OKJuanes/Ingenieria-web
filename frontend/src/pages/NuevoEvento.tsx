import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import '../assets/styles/NuevoEvento.css';

const NuevoEvento: React.FC = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    tipo: 'conferencia',
    fecha: '',
    participantes: '',
    organizador: '',
    patrocinador: ''
  });

  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Evento creado:', formData);
    navigate('/eventos');
  };

  return (
    <div className="nuevo-evento-container">
      <Navbar />
      <div className="form-container">
        <h2>Crear Nuevo Evento</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nombre del Evento</label>
            <input 
              type="text" 
              value={formData.nombre}
              onChange={(e) => setFormData({...formData, nombre: e.target.value})}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Tipo de Evento</label>
              <select
                value={formData.tipo}
                onChange={(e) => setFormData({...formData, tipo: e.target.value})}
              >
                <option value="conferencia">Conferencia</option>
                <option value="hackathon">Hackathon</option>
                <option value="bootcamp">Bootcamp</option>
              </select>
            </div>

            <div className="form-group">
              <label>Fecha</label>
              <input 
                type="date" 
                value={formData.fecha}
                onChange={(e) => setFormData({...formData, fecha: e.target.value})}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn-submit">Guardar Evento</button>
        </form>
      </div>
    </div>
  );
};

export default NuevoEvento;