import React, { useEffect, useState } from 'react';
import { getAllUsers, updateUserRole, User } from '../services/userService';
import Navbar from '../components/common/Navbar';
import { useNavigate } from 'react-router-dom';

const CambiarRoles: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const data = await getAllUsers();
        setUsers(data);
        setError(null);
      } catch (err: any) {
        console.error("Error fetching users:", err);
        setError(err.message || "Error al cargar usuarios");
        
        // Si el error es por permisos, redirigir después de un tiempo
        if (err.message.includes('permisos')) {
          setTimeout(() => {
            navigate('/home-usuario');
          }, 3000);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [navigate]);

  const handleRoleChange = async (userId: number, newRole: 'admin' | 'usuario') => {
    try {
      await updateUserRole(userId, newRole);
      // Actualizar la lista de usuarios después del cambio exitoso
      setUsers(prev => prev.map(user => 
        user.id === userId 
          ? { ...user, role: newRole } 
          : user
      ));
    } catch (err: any) {
      setError(err.message);
      console.error("Error changing role:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="container mx-auto px-4 py-8 pt-20">
        <h2 className="text-2xl font-bold mb-6">Cambiar Roles de Usuarios</h2>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        {loading ? (
          <div className="text-center py-10">
            <p className="text-gray-600">Cargando usuarios...</p>
          </div>
        ) : !error ? (
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuario</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Correo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rol Actual</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acción</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map(user => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap">{user.username}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{user.correo}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{user.nombre} {user.apellido}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {user.role === 'admin' ? 'Administrador' : 'Usuario'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.role === 'admin' ? (
                        <button
                          className="bg-yellow-500 hover:bg-yellow-600 text-white py-1 px-3 rounded text-sm"
                          onClick={() => handleRoleChange(user.id, 'usuario')}
                        >
                          Volver Usuario
                        </button>
                      ) : (
                        <button
                          className="bg-purple-600 hover:bg-purple-700 text-white py-1 px-3 rounded text-sm"
                          onClick={() => handleRoleChange(user.id, 'admin')}
                        >
                          Hacer Admin
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default CambiarRoles;