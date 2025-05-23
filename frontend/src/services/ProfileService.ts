import { API_URL } from '../main';
import { getToken } from './authService';

const getAuthHeaders = () => ({
    Authorization: `Bearer ${getToken()}`,
});
import { getUserData, UserData } from './authService';

/**
 * Interfaz extendida para datos completos del perfil de usuario
 * Incluye todas las propiedades necesarias para el componente Profile
 */
export interface UserProfileData extends UserData {
  nombre?: string;
  apellido?: string;
  correo?: string;
  // Otros campos de perfil que puedan existir en tu backend
}

/**
 * Obtiene los datos completos del perfil de usuario desde localStorage
 * @returns El objeto con datos del perfil o null si no existe o es inválido
 */
export const getUserProfileData = (): UserProfileData | null => {
  // Usa la misma clave que authService para mantener consistencia
  const data = localStorage.getItem('userData');
  if (!data) return null;
  
  try {
    const parsedData = JSON.parse(data);
    
    // Validación básica de datos
    if (!parsedData || !parsedData.username) {
      console.warn("Los datos de perfil en localStorage son inválidos o incompletos");
      return null;
    }
    
    // Retorna los datos extendidos como UserProfileData
    return parsedData as UserProfileData;
  } catch (e) {
    console.error("Error al parsear datos de perfil desde localStorage:", e);
    return null;
  }
};

/**
 * Actualiza el perfil de usuario en el backend
 * @param profileData Datos de perfil a actualizar
 * @returns Promise con los datos actualizados
 */
export const updateUserProfile = async (profileData: {
  nombre?: string;
  apellido?: string;
  correo?: string;
}): Promise<UserProfileData> => {
  // Obtener datos actuales del usuario para mantener la información completa
  const currentUserData = getUserData();
  if (!currentUserData) {
    throw new Error('No hay sesión de usuario activa');
  }
  
  const response = await fetch(`${API_URL}/api/v1/usuario/perfil/Editar`, {
    method: 'PUT',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(profileData),
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Error al actualizar el perfil' }));
    throw new Error(errorData.message || 'Error al actualizar el perfil');
  }
  
  const updatedUserData = await response.json();
  
  // Combinar datos existentes con los actualizados
  const mergedUserData = {
    ...currentUserData,
    ...updatedUserData
  };
  
  // Actualizar datos en localStorage para mantener sesión actualizada
  localStorage.setItem('userData', JSON.stringify(mergedUserData));
  
  return mergedUserData as UserProfileData;
};

/**
 * Elimina la cuenta del usuario en el backend
 * @returns Promise<void>
 */
export const deleteUserAccount = async (): Promise<void> => {
  const response = await fetch(`${API_URL}/api/v1/usuario/perfil/Eliminar`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Error al eliminar la cuenta' }));
    throw new Error(errorData.message || 'Error al eliminar la cuenta');
  }
  
  // Limpiar localStorage después de eliminar la cuenta
  localStorage.clear();
};

/**
 * Obtiene los datos de perfil directamente desde el backend
 * Útil para asegurar que tenemos los datos más recientes
 * @returns Promise con los datos de perfil actualizados
 */
export const fetchUserProfile = async (): Promise<UserProfileData> => {
  const response = await fetch(`${API_URL}/api/v1/usuario/perfil`, {
    headers: getAuthHeaders(),
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Error al obtener datos de perfil' }));
    throw new Error(errorData.message || 'Error al obtener datos de perfil');
  }
  
  const profileData = await response.json();
  
  // Actualizar localStorage con los datos más recientes
  const currentUserData = getUserData();
  if (currentUserData) {
    const updatedUserData = {
      ...currentUserData,
      ...profileData
    };
    localStorage.setItem('userData', JSON.stringify(updatedUserData));
  }
  
  return profileData as UserProfileData;
};