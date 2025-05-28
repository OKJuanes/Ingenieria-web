import React, { useEffect, useState } from 'react';
import { getAllUsers, updateUserRole, User } from '../services/userService';
import Navbar from '../components/common/Navbar';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import "../assets/styles/CambiarRoles.css";
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
    // Mensaje de confirmación personalizado
    let confirmMsg = '';
    if (newRole === 'admin') {
      confirmMsg = '¿Estás seguro que quieres que este usuario sea ADMINISTRADOR?';
    } else {
      confirmMsg = '¿Estás seguro que quieres que este usuario vuelva a ser USUARIO normal?';
    }
    if (!window.confirm(confirmMsg)) return;

    try {
      await updateUserRole(userId, newRole);
      setUsers(prev => prev.map(user =>
        user.id === userId
          ? { ...user, role: newRole }
          : user
      ));
      toast.success('Rol actualizado correctamente');
    } catch (err: any) {
      toast.error(`Error al cambiar el rol: ${err.message}`);
      console.error("Error changing role:", err);
    }
  };

  return (
    <div className="cambiar-roles-bg">
      <Navbar />
      <div className="cambiar-roles-container">
        <h2 className="text-3xl font-bold text-white mb-8 mt-2">Cambiar Roles de Usuarios</h2>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        {loading ? (
          <div className="text-center py-10">
            <p className="text-white text-lg">Cargando usuarios...</p>
          </div>
        ) : !error ? (
          <div className="cambiar-roles-table-wrapper">
            <table className="cambiar-roles-table">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-violet-900 uppercase tracking-wider">Usuario</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-violet-900 uppercase tracking-wider">Correo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-violet-900 uppercase tracking-wider">Nombre</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-violet-900 uppercase tracking-wider">Rol Actual</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-violet-900 uppercase tracking-wider">Acción</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap">{user.username}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{user.correo}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{user.nombre} {user.apellido}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`role-badge ${user.role === 'admin' ? 'role-badge-admin' : 'role-badge-user'}`}>
                        {user.role === 'admin' ? 'Administrador' : 'Usuario'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.role === 'admin' ? (
                        <button
                          className="role-btn role-btn-secondary"
                          onClick={() => handleRoleChange(user.id, 'usuario')}
                        >
                          Volver Usuario
                        </button>
                      ) : (
                        <button
                          className="role-btn"
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