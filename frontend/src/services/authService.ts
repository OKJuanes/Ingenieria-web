// src/services/authService.ts
import { API_URL } from '../main';

// Define una interfaz para los datos del usuario.
// ¡AHORA INCLUYE EL 'id'!
export interface UserData {
  id: string; // Asume que el ID es un string (ej. UUID). Si es un número, cambia a 'number'.
  username: string;
  role: 'admin' | 'user';
  // Puedes añadir más campos aquí si tu backend los va a devolver,
  // como nombre completo, email, etc.
}

const TOKEN_KEY = 'authToken';
const USER_DATA_KEY = 'userData';

// Función para obtener el token del localStorage
export const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
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
export const setAuthData = (token: string, role: 'admin' | 'user', username: string, id: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_DATA_KEY, JSON.stringify({ id, username, role })); // ¡ALMACENA EL ID!
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

  // ¡AHORA RECUPERA EL 'id' DE LA RESPUESTA DEL BACKEND!
  const { token, role, username, id } = await response.json(); 
  if (!id) {
    throw new Error('Backend did not return user ID on login. Check your backend response for /auth/login.');
  }

  // Almacenar el token y los datos del usuario en localStorage
  setAuthData(token, (role as 'admin' | 'user') || 'user', username, id); // ¡PASANDO EL ID!
  return { id, username, role: (role as 'admin' | 'user') || 'user' };
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
  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ correo, nombre, apellido, username: usernameInput, password: passwordInput }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Error en el registro');
  }

  // ¡AHORA RECUPERA EL 'id' DE LA RESPUESTA DEL BACKEND!
  const { token, role, username, id } = await response.json();
  if (!id) {
    throw new Error('Backend did not return user ID on registration. Check your backend response for /auth/register.');
  }

  // Almacena el token y los datos del usuario recién registrado
  setAuthData(token, (role as 'admin' | 'user') || 'user', username, id); // ¡PASANDO EL ID!
  return { id, username, role: (role as 'admin' | 'user') || 'user' };
};