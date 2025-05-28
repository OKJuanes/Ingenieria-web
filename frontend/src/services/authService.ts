// src/services/authService.ts
import { API_URL } from '../main';
import { jwtDecode } from 'jwt-decode';

// Define una interfaz para los datos del usuario.
// ¡AHORA INCLUYE EL 'id'!
export interface UserData {
  id: string; // Asume que el ID es un string (ej. UUID). Si es un número, cambia a 'number'.
  username: string;
  role: 'admin' | 'usuario';
}

const TOKEN_KEY = 'authToken';
const USER_DATA_KEY = 'userData';

export const setAuthToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
};

// Obtener el token
export const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

// Eliminar el token (logout)
export const clearAuthToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
};

// Función para obtener los datos del usuario del localStorage
export const getUserData = (): UserData | null => {
  const data = localStorage.getItem(USER_DATA_KEY);
  try {
    const parsedData = data ? JSON.parse(data) : null;
    // Asegurarse de que el ID exista al parsear. Si no, forzar logout.
    if (parsedData && !parsedData.id) {
        console.warn("User data in localStorage is missing ID. Clearing data.");
        clearAuthData();
        return null;
    }
    return parsedData;
  } catch (e) {
    console.error("Error parsing user data from localStorage", e);
    localStorage.removeItem(USER_DATA_KEY); // Limpiar datos corruptos
    return null;
  }
};

// Función para almacenar el token y los datos del usuario en localStorage
// ¡AHORA RECIBE EL 'id' Y LO ALMACENA!
export const setAuthData = (token: string, userData: any): void => {
  localStorage.setItem(TOKEN_KEY, token);
  
  // Asegúrate de guardar TODOS los campos del usuario
  const userToStore = {
    id: userData.id,
    username: userData.username,
    role: userData.role,
    nombre: userData.nombre || '',  // Guarda estos campos adicionales
    apellido: userData.apellido || '',
    correo: userData.correo || ''
  };
  
  localStorage.setItem(USER_DATA_KEY, JSON.stringify(userToStore));
};

// Función para eliminar el token y los datos del usuario de localStorage (cerrar sesión)
export const clearAuthData = (): void => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_DATA_KEY);
};

// Función para verificar si el usuario está autenticado
export const isAuthenticated = (): boolean => {
  return !!getToken() && !!getUserData(); // Asegurarse de que ambos existan
};

// Función para verificar si el usuario es un administrador
export const isAdmin = (): boolean => {
  const userData = getUserData();
  return userData?.role === 'admin';
};

// ==========================================================
// FUNCIONES DE AUTENTICACIÓN CON BACKEND REAL
// ==========================================================

interface JwtPayload {
  sub: string;
  role?: string;
  id?: string | number;
  exp: number;
  // otros campos que pueda tener tu JWT
}

/**
 * Realiza una solicitud de inicio de sesión al backend.
 * @param usernameInput El nombre de usuario.
 * @param passwordInput La contraseña.
 * @returns Promise<UserData> Los datos del usuario autenticado.
 * @throws Error Si las credenciales son incorrectas o hay un error en la API.
 */
export const login = async (usernameInput: string, passwordInput: string): Promise<UserData> => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username: usernameInput, password: passwordInput }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Credenciales incorrectas');
  }

  const { token } = await response.json();
  
  // Decodifica el token para extraer datos
  const decoded = jwtDecode<JwtPayload>(token);
  
  // Extrae los datos básicos del token
  const id = decoded.id?.toString() || '';
  const role = decoded.role?.toLowerCase() === 'admin' ? 'admin' : 'usuario';
  const username = decoded.sub || usernameInput;

  // Almacena el token y los datos mínimos necesarios
  setAuthData(token, { id, username, role });
  
  return { id, username, role };
};

/**
 * Realiza una solicitud de registro de nuevo usuario al backend.
 * @param correo El correo electrónico del usuario.
 * @param nombre El nombre del usuario.
 * @param apellido El apellido del usuario.
 * @param usernameInput El nombre de usuario.
 * @param passwordInput La contraseña.
 * @returns Promise<UserData> Los datos del usuario registrado.
 * @throws Error Si el registro falla (ej. usuario/correo ya existe).
 */
export const register = async (correo: string, nombre: string, apellido: string, usernameInput: string, passwordInput: string): Promise<UserData> => {
  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ correo, nombre, apellido, username: usernameInput, password: passwordInput }),
    });

    // Primero verificamos si la respuesta es exitosa
    if (!response.ok) {
      // Intentamos leer el mensaje de error del backend
      let errorMessage = 'Error en el registro';
      
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch (e) {
        // Si no podemos parsear el JSON, usamos el texto de la respuesta
        errorMessage = await response.text() || errorMessage;
      }
      
      // Si el error contiene palabras clave relacionadas con duplicación
      if (response.status === 400 || 
          errorMessage.includes('ya existe') || 
          errorMessage.includes('duplicate') ||
          errorMessage.includes('already exists') ||
          errorMessage.includes('duplicado')) {
        throw new Error('El nombre de usuario o correo ya está en uso. Por favor, intenta con otro.');
      }
      
      throw new Error(errorMessage);
    }

    // Solo parseamos como JSON si la respuesta fue exitosa
    const data = await response.json();
    
    // Almacenar token si existe
    if (data.token) {
      localStorage.setItem('token', data.token);
    }
    
    return {
      id: data.id,
      username: data.username,
      role: data.role || 'usuario'
    };
  } catch (error: any) {
    // Re-lanzar el error para que se maneje en el componente
    throw error;
  }
};

/**
 * Realiza una solicitud de actualización del perfil del usuario.
 * @param userData Los datos actualizados del usuario.
 * @returns Promise<UserData> Los datos del usuario actualizado.
 * @throws Error Si la actualización falla.
 */
export const updateUserProfile = async (userData: any): Promise<UserData> => {
  const response = await fetch(`${API_URL}/api/v1/usuarios/perfil`, {
    method: 'PUT',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Error al actualizar el perfil');
  }
  
  const updatedUser = await response.json();
  
  // Actualizar datos en localStorage
  localStorage.setItem('userData', JSON.stringify(updatedUser));
  
  return updatedUser;
};

// Devuelve los headers de autorización usando el token almacenado
const getAuthHeaders = (): Record<string, string> => {
  const token = getToken();
  return token
    ? { Authorization: `Bearer ${token}` }
    : {};
};

// Añade esta función adicional
export const getUserProfileData = (): UserProfileData | null => {
  const data = localStorage.getItem(USER_DATA_KEY);
  if (!data) return null;
  
  try {
    const parsedData = JSON.parse(data);
    // Validación básica
    if (!parsedData || !parsedData.id || !parsedData.username) {
      console.warn("User data in localStorage is invalid. Clearing data.");
      clearAuthData();
      return null;
    }
    return parsedData;
  } catch (e) {
    console.error("Error parsing user profile data from localStorage", e);
    return null;
  }
};

// Añade esta interfaz
export interface UserProfileData extends UserData {
  nombre?: string;
  apellido?: string;
  correo?: string;
}