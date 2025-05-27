import React, { useEffect, useState } from 'react';
import { getAllHitos } from '../services/hitoService';
import { getUserData } from '../services/authService';
import Navbar from '../components/common/Navbar';
import '../assets/styles/global.css';

interface Hito {
  id: number;
  nombre: string;
  descripcion?: string;
  fecha: string;
  usuarioGanadorId?: number | null;
}

const MisHitos: React.FC = () => {
  const [hitos, setHitos] = useState<Hito[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const user = getUserData();

  useEffect(() => {
    if (!user || !user.id) {
      setError('No se pudo obtener la información del usuario.');
      setLoading(false);
      return;
    }
    const fetchHitos = async () => {
      try {
        const allHitos = await getAllHitos();
        const misHitos = allHitos.filter(
          (hito: Hito) => String(hito.usuarioGanadorId) === String(user.id)
        );
        setHitos(misHitos);
      } catch (err: any) {
        setError('Error al cargar tus hitos.');
      } finally {
        setLoading(false);
      }
    };
    fetchHitos();
  }, [user?.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-purple-400 to-indigo-600 flex items-center justify-center">
        <p className="text-white text-2xl">Cargando tus hitos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-purple-400 to-indigo-600 flex items-center justify-center">
        <p className="text-red-300 text-2xl">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-400 to-indigo-600">
      <Navbar />
      <div className="container mx-auto p-4">
        <h2 className="text-3xl font-bold text-white mb-6">Mis Hitos Ganados</h2>
        {hitos.length === 0 ? (
          <p className="text-white text-lg">Aún no tienes hitos asignados como ganador.</p>
        ) : (
          <ul className="space-y-4">
            {hitos.map((hito) => (
              <li key={hito.id} className="bg-white rounded shadow p-4">
                <h3 className="font-semibold text-violet-800">{hito.nombre}</h3>
                {hito.descripcion && (
                  <p className="text-gray-700 mb-1">{hito.descripcion}</p>
                )}
                <p className="text-sm text-gray-500">Fecha: {hito.fecha}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default MisHitos;