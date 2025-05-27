import React, { useEffect, useState } from 'react';
import { getMisHitosGanados, Hito } from '../services/hitoService';
import Navbar from '../components/common/Navbar';
import '../assets/styles/MisHitos.css'; // Si necesitas estilos específicos

const MisHitos: React.FC = () => {
  const [hitos, setHitos] = useState<Hito[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHitos = async () => {
      setLoading(true);
      setError(null);
      try {
        // Usar el nuevo método específico en lugar de getAllHitos y filtrar
        const hitosGanados = await getMisHitosGanados();
        setHitos(hitosGanados);
      } catch (err: any) {
        console.error("Error cargando hitos:", err);
        setError('Error al cargar tus hitos: ' + (err.message || 'Error desconocido'));
      } finally {
        setLoading(false);
      }
    };
    
    fetchHitos();
  }, []);

  // Reemplaza tu función formatDate con esta:
  const formatDate = (dateString: string) => {
    if (!dateString) return 'Sin fecha';
    
    try {
      // Solución para el problema de zona horaria
      const [year, month, day] = dateString.split('-');
      
      // Si tenemos año, mes y día, crear fecha especificando horas como 12:00 para evitar cambios por zona horaria
      if (year && month && day) {
        const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), 12, 0, 0);
        return new Intl.DateTimeFormat('es-ES', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric',
          timeZone: 'UTC' // Usar UTC para evitar ajustes de zona horaria
        }).format(date);
      }
      
      // Fallback para otros formatos de fecha
      const date = new Date(dateString);
      if (!isNaN(date.getTime())) {
        // Usar toLocaleDateString con opciones explícitas para evitar problemas de zona horaria
        return date.toLocaleDateString('es-ES', { 
          timeZone: 'UTC',
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        });
      }
      
      return 'Fecha inválida';
    } catch (error) {
      console.error("Error al formatear fecha:", error);
      return 'Fecha inválida';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-400 to-indigo-600">
      <Navbar />
      <div className="container mx-auto p-4">
        <h2 className="text-3xl font-bold text-white mb-6">Mis Hitos Ganados</h2>
        
        {loading && (
          <div className="bg-white bg-opacity-20 p-4 rounded-lg shadow">
            <p className="text-white text-lg">Cargando tus hitos...</p>
          </div>
        )}
        
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 p-4 rounded shadow mb-4">
            <p className="text-red-700">{error}</p>
          </div>
        )}
        
        {!loading && !error && hitos.length === 0 && (
          <div className="bg-white bg-opacity-20 p-6 rounded-lg shadow">
            <p className="text-white text-lg">Aún no tienes hitos asignados como ganador.</p>
          </div>
        )}
        
        {!loading && !error && hitos.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {hitos.map((hito) => (
              <div key={hito.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-5">
                  <div className="flex justify-between items-start">
                    <h3 className="text-xl font-bold text-purple-800">{hito.titulo}</h3>
                    <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
                      {hito.categoria}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 mt-2">{hito.descripcion}</p>
                  
                  <div className="mt-4 pt-2 border-t border-gray-100">
                    <p className="text-sm text-gray-500">
                      <span className="font-medium">Fecha:</span>{' '}
                      {formatDate(hito.fechaRegistro)}
                    </p>
                    
                    <p className="text-sm text-gray-500">
                      <span className="font-medium">Evento:</span>{' '}
                      {hito.eventoNombre ||
                       (hito.eventoId ? `Evento #${hito.eventoId}` : 'Evento no especificado')}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MisHitos;