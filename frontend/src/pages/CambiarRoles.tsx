import { useEffect, useState } from 'react';
import { getAllUsers, updateUserRole, User } from '../services/userService';
import Navbar from '../components/common/Navbar';
import '../assets/styles/global.css';

const CambiarRoles = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getAllUsers()
      .then(setUsers)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleRoleChange = async (userId: number, newRole: 'admin' | 'usuario') => {
    try {
      const updated = await updateUserRole(userId, newRole);
      setUsers(users =>
        users.map(u => (u.id === userId ? { ...u, role: updated.role } : u))
      );
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-r from-purple-400 to-indigo-600">
      <Navbar />
      <div className="container mx-auto p-8">
        <p className="text-white text-center text-lg">Cargando usuarios...</p>
      </div>
    </div>
  );
  if (error) return (
    <div className="min-h-screen bg-gradient-to-r from-purple-400 to-indigo-600">
      <Navbar />
      <div className="container mx-auto p-8">
        <p className="text-red-300 text-center text-lg">Error: {error}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-400 to-indigo-600">
      <Navbar />
      <div className="container mx-auto p-8">
        <h2 className="text-3xl font-bold text-white mb-6">Gestión de Roles de Usuarios</h2>
        <div className="bg-white rounded-lg shadow-md p-6 overflow-x-auto">
          <table className="min-w-full leading-normal">
            <thead>
              <tr>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Usuario
                </th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Correo
                </th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Rol actual
                </th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Acción
                </th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-4 text-gray-500">
                    No hay usuarios para mostrar.
                  </td>
                </tr>
              ) : (
                users.map(user => (
                  <tr key={user.id} className="hover:bg-violet-50 transition">
                    <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm font-semibold">{user.username}</td>
                    <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">{user.correo}</td>
                    <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm capitalize">{user.role}</td>
                    <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm text-center">
                      {user.role === 'admin' ? (
                        <button
                          className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-1 px-3 rounded transition duration-200"
                          onClick={() => handleRoleChange(user.id, 'usuario')}
                        >
                          Cambiar a Usuario
                        </button>
                      ) : (
                        <button
                          className="bg-violet-700 hover:bg-violet-800 text-white font-bold py-1 px-3 rounded transition duration-200"
                          onClick={() => handleRoleChange(user.id, 'admin')}
                        >
                          Cambiar a Admin
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CambiarRoles;