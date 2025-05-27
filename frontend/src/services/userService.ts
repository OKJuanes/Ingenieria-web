// src/services/userService.ts
import { API_URL } from '../main';
import { isAdmin, getUserData, getToken } from '../services/authService'; // Añadir getToken aquí
import {jwtDecode} from 'jwt-decode';

// Definir la interfaz User
export interface User {
  id: number;
  username: string;
  correo: string;
  nombre: string;
  apellido: string;
  role: string;
}

// Mejora la función para verificar si el usuario tiene permisos de administrador
export const verifyAdminPermissions = (): boolean => {
  // Usar la función isAdmin importada de authService
  return isAdmin();
};

// Función para obtener todos los usuarios
export const getAllUsers = async (): Promise<User[]> => {
  const token = getToken(); // Usar getToken() en lugar de localStorage.getItem
  if (!token) {
    throw new Error('No hay sesión activa. Por favor inicia sesión nuevamente.');
  }
  
  try {
    const response = await fetch(`${API_URL}/api/v1/usuario/todos`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      if (response.status === 403) {
        throw new Error('No tienes permisos suficientes para ver la lista de usuarios.');
      }
      
      const errorText = await response.text();
      throw new Error(`Error al obtener usuarios: ${errorText || response.statusText}`);
    }

    const data = await response.json();
    
    return data.map((user: any) => ({
      id: user.id,
      username: user.username,
      correo: user.correo,
      nombre: user.nombre,
      apellido: user.apellido,
      role: user.rol.toLowerCase()
    }));
  } catch (error: any) {
    console.error("Error en getAllUsers:", error);
    throw error;
  }
};

// Función para actualizar el rol de un usuario
export const updateUserRole = async (userId: number, newRole: string): Promise<any> => {
  // Verificar permisos de administrador antes de hacer la llamada
  if (!verifyAdminPermissions()) {
    throw new Error('No tienes permisos para cambiar roles de usuarios.');
  }

  const token = getToken(); // Usar getToken() aquí también
  
  try {
    const response = await fetch(`${API_URL}/api/v1/usuario/${userId}/cambiar-rol`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ rol: newRole.toUpperCase() })
    });

    if (!response.ok) {
      if (response.status === 403) {
        throw new Error('No tienes permisos suficientes para cambiar roles');
      }
      
      const errorText = await response.text();
      console.error("Error response:", errorText);
      throw new Error(`Error al actualizar rol: ${errorText || response.statusText}`);
    }

    return response.json();
  } catch (error: any) {
    console.error("Error en updateUserRole:", error);
    throw error;
  }
};