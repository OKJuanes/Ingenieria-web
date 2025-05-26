// src/services/userService.ts
import { API_URL } from '../main';
import { getToken } from './authService'; // Asegúrate de que getToken esté en authService.ts y exportado

// Interfaz para la estructura de datos de un usuario
// Asegúrate de que esto coincida con lo que tu backend devuelve para un usuario
export interface User {
  id: number; // O string, si tu backend usa UUIDs
  username: string;
  nombre?: string;
  apellido?: string;
  correo: string;
  role: 'admin' | 'usuario'; // Solo estos dos roles
  // Añade cualquier otro campo que tu backend devuelva para un usuario (ej. fecha de registro, estado, etc.)
}

// Función auxiliar para obtener los headers con el token de autenticación
const getAuthHeaders = () => {
  const token = getToken();
  if (!token) {
    // Aquí puedes redirigir al login o lanzar un error, dependiendo de tu manejo de errores global
    throw new Error('No authentication token found. Please log in.');
  }
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
};

/**
 * Obtiene la lista de todos los usuarios desde el backend.
 * Esta función requiere que el usuario autenticado tenga el rol de administrador.
 * @returns Una promesa que resuelve a un array de objetos User.
 */
export const getAllUsers = async (): Promise<User[]> => {
  try {
    const response = await fetch(`${API_URL}/api/v1/users`, { // Esta es la URL esperada en tu backend
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      // Si el backend devuelve un 403 Forbidden, el errorData.message lo contendrá
      throw new Error(errorData.message || 'Error al obtener los usuarios.');
    }

    const usersData = await response.json();
    // Asegurarse de que el rol sea 'admin' o 'usuario' al mapear
    return usersData.map((user: any) => ({
      ...user,
      role: user.role && (user.role.toLowerCase() === 'admin' ? 'admin' : 'usuario')
    }));
  } catch (error) {
    console.error('Error in getAllUsers service:', error);
    throw error;
  }
};

/**
 * Actualiza el rol de un usuario específico en el backend.
 * Esta función requiere que el usuario autenticado tenga el rol de administrador.
 * @param userId El ID del usuario cuyo rol se va a actualizar.
 * @param newRole El nuevo rol a asignar ('admin' o 'usuario').
 * @returns Una promesa que resuelve al objeto User actualizado.
 */
export const updateUserRole = async (userId: number, newRole: 'admin' | 'usuario'): Promise<User> => {
  try {
    const response = await fetch(`${API_URL}/api/v1/users/${userId}/role`, { // Esta es la URL esperada en tu backend
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ role: newRole }), // El backend espera un objeto JSON con la propiedad 'role'
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Error al actualizar el rol del usuario ${userId}.`);
    }

    const updatedUser = await response.json();
    // Asegurarse de que el rol sea 'admin' o 'usuario' al retornar
    return {
      ...updatedUser,
      role: updatedUser.role && (updatedUser.role.toLowerCase() === 'admin' ? 'admin' : 'usuario')
    };
  } catch (error) {
    console.error('Error in updateUserRole service:', error);
    throw error;
  }
};