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
export const setAuthData = (token: string, role: 'admin' | 'usuario', username: string, id: string): void => {
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

  // Solo recupera el token de la respuesta
  const { token } = await response.json();
  if (!token) {
    throw new Error('Backend did not return token.');
  }

  // Decodifica el token para extraer los datos
  const decoded = jwtDecode<JwtPayload>(token);
  
  // Añade este log para ver qué contiene exactamente el token
  console.log("Token decodificado:", decoded);
  
  // Extrae los datos del token
  const id = decoded.id?.toString() || '';
  const roleFromToken = decoded.role || 'usuario';
  console.log("Rol extraído del token:", roleFromToken);
  
  // Normaliza el rol para asegurarte que siempre es "admin" o "usuario"
  let role: 'admin' | 'usuario';
  if (roleFromToken.toLowerCase() === 'admin') {
    role = 'admin';
  } else {
    role = 'usuario';
  }
  
  const username = decoded.sub || usernameInput;

  // Almacena el token y los datos en localStorage
  setAuthData(token, role, username, id);
  
  // Retorna los datos del usuario
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
  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ correo, nombre, apellido, username: usernameInput, password: passwordInput }),
  });

  // Lee el cuerpo de la respuesta UNA SOLA VEZ
  const data = await response.json();

  // Verifica si la respuesta es exitosa
  if (!response.ok) {
    throw new Error(data.message || 'Error en el registro');
  }

  // Extrae el token del objeto data ya parseado
  const { token } = data;
  if (!token) {
    throw new Error('Backend did not return token on registration.');
  }

  // Decodifica el token para extraer los datos
  const decoded = jwtDecode<JwtPayload>(token);
  
  // Extrae los datos del token
  const id = decoded.id?.toString() || '';
  const role = (decoded.role as 'admin' | 'usuario') || 'usuario';
  const username = decoded.sub || usernameInput;

  // Almacena el token y los datos en localStorage
  setAuthData(token, role as any, username, id);
  
  // Retorna los datos del usuario
  return { id, username, role: role as any };
};