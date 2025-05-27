import { useEffect, useState } from 'react';
import { getAllUsers, updateUserRole, User } from '../services/userService';
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

  if (loading) return <div>Cargando usuarios...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="container mt-4">
      <h2>Cambiar Roles de Usuarios</h2>
      <table className="table">
        <thead>
          <tr>
            <th>Usuario</th>
            <th>Correo</th>
            <th>Rol Actual</th>
            <th>Acción</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td>{user.username}</td>
              <td>{user.correo}</td>
              <td>{user.role}</td>
              <td>
                {user.role === 'admin' ? (
                  <button
                    className="btn btn-warning btn-sm"
                    onClick={() => handleRoleChange(user.id, 'usuario')}
                  >
                    Volver Usuario
                  </button>
                ) : (
                  <button
                    className="btn btn-success btn-sm"
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
  );
};

export default CambiarRoles;