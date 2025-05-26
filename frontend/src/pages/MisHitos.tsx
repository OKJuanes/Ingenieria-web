import React, { useEffect, useState } from 'react';
import { getAllHitos } from '../services/hitoService';
import { getUserData } from '../services/authService';

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
      setError('No se pudo obtener el usuario actual.');
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
        setError('Error al cargar tus hitos');
      } finally {
        setLoading(false);
      }
    };
    fetchHitos();
  }, [user?.id]);

  if (loading) return <div className="text-center mt-4">Cargando...</div>;
  if (error) return <div className="text-center text-red-500">{error}</div>;

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Mis Hitos Ganados</h2>
      {hitos.length === 0 ? (
        <p>No tienes hitos asignados como ganador.</p>
      ) : (
        <ul className="space-y-4">
          {hitos.map((hito) => (
            <li key={hito.id} className="bg-white rounded shadow p-4">
              <h3 className="font-semibold">{hito.nombre}</h3>
              <p>{hito.descripcion}</p>
              <p className="text-sm text-gray-500">Fecha: {hito.fecha}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MisHitos;