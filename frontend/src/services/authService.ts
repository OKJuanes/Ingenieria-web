/*import { API_URL } from '../main'; // Asegúrate de que API_URL esté correctamente exportado en main.tsx

// Define una interfaz para los datos del usuario que podrías querer almacenar
export interface UserData {
  username: string;
  role: 'admin' | 'user';
  // Otros datos del usuario que necesites (ej. id, nombre, email)
}

const TOKEN_KEY = 'authToken';
const USER_DATA_KEY = 'userData'; // Para almacenar el rol y username

// Función para obtener el token del localStorage
export const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

// Función para obtener los datos del usuario del localStorage
export const getUserData = (): UserData | null => {
  const data = localStorage.getItem(USER_DATA_KEY);
  return data ? JSON.parse(data) : null;
};

// Función para almacenar el token y los datos del usuario en localStorage
export const setAuthData = (token: string, role: 'admin' | 'user', username: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_DATA_KEY, JSON.stringify({ username, role }));
};

// Función para eliminar el token y los datos del usuario de localStorage (cerrar sesión)
export const clearAuthData = (): void => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_DATA_KEY);
};

// Función para verificar si el usuario está autenticado
export const isAuthenticated = (): boolean => {
  return !!getToken();
};

// Función para verificar si el usuario es un administrador
export const isAdmin = (): boolean => {
  const userData = getUserData();
  return userData?.role === 'admin';
};

// Función de login
export const login = async (username: string, password: string): Promise<UserData> => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Credenciales incorrectas');
  }

  const { token, role, username: returnedUsername } = await response.json(); // Asegúrate de que el backend devuelve 'username'
  setAuthData(token, role, returnedUsername || username); // Usar el username devuelto por el backend o el enviado
  return { username: returnedUsername || username, role };
};

// Función de registro
export const register = async (correo: string, nombre: string, apellido: string, username: string, password: string): Promise<UserData> => {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ correo, nombre, apellido, username, password }),
    });
  
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error en el registro');
    }
  
    const { token, role, username: returnedUsername } = await response.json(); // Asume que el backend devuelve el rol y el username en el registro
    setAuthData(token, role || 'user', returnedUsername || username); // Por defecto 'user' si el backend no lo devuelve
    return { username: returnedUsername || username, role: role || 'user' };
  };*/
  // src/services/authService.ts

// Asegúrate de que API_URL esté definido en main.tsx si lo usas en otros servicios,
// pero para este mock de login/registro, no será utilizado.
// import { API_URL } from '../main';

// Define una interfaz para los datos del usuario que podrías querer almacenar
export interface UserData {
    username: string;
    role: 'admin' | 'user';
    // Puedes añadir más campos aquí si tu backend los va a devolver,
    // como id, nombre completo, email, etc.
  }
  
  const TOKEN_KEY = 'authToken';
  const USER_DATA_KEY = 'userData'; // Para almacenar el rol y username
  
  // Función para obtener el token del localStorage
  export const getToken = (): string | null => {
    return localStorage.getItem(TOKEN_KEY);
  };
  
  // Función para obtener los datos del usuario del localStorage
  export const getUserData = (): UserData | null => {
    const data = localStorage.getItem(USER_DATA_KEY);
    try {
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.error("Error parsing user data from localStorage", e);
      return null;
    }
  };
  
  // Función para almacenar el token y los datos del usuario en localStorage
  export const setAuthData = (token: string, role: 'admin' | 'user', username: string): void => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_DATA_KEY, JSON.stringify({ username, role }));
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
  // MOCKS TEMPORALES PARA LOGIN Y REGISTRO SIN BACKEND
  // ¡RECUERDA ELIMINAR O REVERTIR ESTO CUANDO CONECTES EL BACKEND REAL!
  // ==========================================================
  
  // Simula una base de datos de usuarios para el mock
  const mockUsers = [
    { username: 'admin', password: 'adminpass', role: 'admin', correo: 'admin@example.com', nombre: 'Admin', apellido: 'User' },
    { username: 'user', password: 'userpass', role: 'user', correo: 'user@example.com', nombre: 'Regular', apellido: 'User' },
  ];
  
  // Función de login (MOCK TEMPORAL)
  export const login = async (usernameInput: string, passwordInput: string): Promise<UserData> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => { // Simula un retardo de red
        const userFound = mockUsers.find(
          user => user.username === usernameInput && user.password === passwordInput
        );
  
        if (userFound) {
          // Generar un token simulado (no real JWT)
          const fakeToken = `fake-token-for-${userFound.username}-${Date.now()}`;
          setAuthData(fakeToken, userFound.role as 'admin' | 'user', userFound.username);
          resolve({ username: userFound.username, role: userFound.role as 'admin' | 'user' });
        } else {
          reject(new Error('Credenciales incorrectas (MOCK)'));
        }
      }, 700); // 0.7 segundos de retardo para simular una llamada a la red
    });
  };
  
  // Función de registro (MOCK TEMPORAL)
  export const register = async (correo: string, nombre: string, apellido: string, usernameInput: string, passwordInput: string): Promise<UserData> => {
      return new Promise((resolve, reject) => {
          setTimeout(() => { // Simula un retardo de red
              // Simular si el username ya existe en nuestros mocks
              if (mockUsers.some(u => u.username === usernameInput)) {
                  reject(new Error('El nombre de usuario ya está en uso (MOCK).'));
                  return;
              }
              if (mockUsers.some(u => u.correo === correo)) {
                  reject(new Error('El correo electrónico ya está registrado (MOCK).'));
                  return;
              }
  
              // Simular un nuevo usuario registrado
              const newUser = {
                  id: mockUsers.length + 1, // ID simple para el mock
                  correo,
                  nombre,
                  apellido,
                  username: usernameInput,
                  password: passwordInput, // En un backend real, la contraseña se hashearía
                  role: 'user' // Por defecto, los registros son para usuarios comunes
              };
              mockUsers.push(newUser); // Añadirlo a nuestra "base de datos" mock
  
              const fakeToken = `fake-token-for-${newUser.username}-${Date.now()}`;
              setAuthData(fakeToken, newUser.role as 'admin' | 'user', newUser.username);
              resolve({ username: newUser.username, role: newUser.role as 'admin' | 'user' });
  
          }, 1000); // 1 segundo de retardo
      });
  };