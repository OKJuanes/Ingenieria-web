// src/pages/Profile.tsx

import React, { useEffect, useState, useCallback } from 'react';

import Navbar from '../components/common/Navbar';

import EventoCard from '../components/eventos/EventoCard';

import { getUserData, isAuthenticated } from '../services/authService';

import { getRegisteredEventsForCurrentUser, Evento, unregisterUserFromEvent } from '../services/eventoService';

import { updateUserProfile, deleteUserAccount, getUserProfileData, fetchUserProfile } from '../services/ProfileService';

import { useNavigate } from 'react-router-dom';

import '../assets/styles/Profile.css';



const Profile: React.FC = () => {

  const navigate = useNavigate();

  const [userData, setUserData] = useState(getUserProfileData()); // Inicializa con datos del localStorage

  const [userEventos, setUserEventos] = useState<Evento[]>([]);

  const [loading, setLoading] = useState<boolean>(true);

  const [error, setError] = useState<string | null>(null);

 

  // Estados para edición de perfil

  const [isEditing, setIsEditing] = useState(false);

  const [profileForm, setProfileForm] = useState({

    nombre: userData?.nombre || '',

    apellido: userData?.apellido || '',

    correo: userData?.correo || ''

  });



  // Redirección con useEffect en lugar de condicional directo

  useEffect(() => {

    if (!isAuthenticated()) {

      navigate('/login', { replace: true });

    }

  }, [navigate]);



  // Efecto para cargar datos actualizados del perfil desde el backend

  useEffect(() => {

    const loadProfileData = async () => {

      if (!isAuthenticated()) {

        navigate('/login', { replace: true });

        return;

      }

     

      try {

        // Obtener datos del perfil directamente del backend

        const profileData = await fetchUserProfile();

        console.log("Datos del perfil cargados:", profileData);

       

        // Actualizar el estado con los datos recibidos

        setUserData(profileData);

       

        // Actualizar también el formulario de edición

        setProfileForm({

          nombre: profileData.nombre || '',

          apellido: profileData.apellido || '',

          correo: profileData.correo || ''

        });

      } catch (err: any) {

        console.error("Error al cargar datos del perfil:", err);

        // No establecer error en el estado para no interrumpir la experiencia

      }

    };

   

    loadProfileData();

  }, [navigate]);



  // Efecto para obtener los eventos a los que el usuario está registrado

  const fetchUserEventos = useCallback(async () => {

    if (!isAuthenticated()) return;

   

    setLoading(true);

    setError(null);

    try {

      const eventos = await getRegisteredEventsForCurrentUser();

      setUserEventos(eventos);

    } catch (err: any) {

      setError(err.message || 'Error al cargar tus eventos registrados.');

      console.error("Profile Component - Error al cargar eventos del usuario:", err);

      if (err.message.includes('No authentication token found')) {

        navigate('/login');

      }

    } finally {

      setLoading(false);

    }

  }, [navigate]);



  useEffect(() => {

    fetchUserEventos();

  }, [fetchUserEventos]);



  // Funciones para manejar la edición del perfil

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {

    const { name, value } = e.target;

    setProfileForm({

      ...profileForm,

      [name]: value

    });

  };



  const handleProfileSubmit = async (e: React.FormEvent) => {

    e.preventDefault();

    try {

      const updatedProfile = await updateUserProfile(profileForm);

      setUserData({

        ...userData!,

        ...updatedProfile

      });

      setIsEditing(false);

      alert('Perfil actualizado con éxito');

    } catch (err: any) {

      alert(`Error al actualizar el perfil: ${err.message}`);

    }

  };



  // Función para manejar la eliminación de cuenta

  const handleDeleteAccount = async () => {

    if (window.confirm('¿Estás seguro de que deseas eliminar tu cuenta? Esta acción no se puede deshacer.')) {

      try {

        await deleteUserAccount();

        alert('Cuenta eliminada con éxito');

        navigate('/login');

      } catch (err: any) {

        alert(`Error al eliminar la cuenta: ${err.message}`);

      }

    }

  };



  // Función para manejar la desinscripción de un evento

  const handleUnregisterClick = async (eventId: number) => {

    try {

      await unregisterUserFromEvent(eventId);

      alert('¡Te has desinscrito del evento exitosamente!');

      fetchUserEventos();

    } catch (err: any) {

      alert(`Error al desinscribirte: ${err.message}`);

    }

  };



  // === Renderizado condicional de estados de la UI ===

  if (loading && userEventos.length === 0) {

    return (

      <div className="min-h-screen bg-gradient-to-r from-purple-400 to-indigo-600 flex items-center justify-center">

        <p className="text-white text-2xl">Cargando perfil...</p>

      </div>

    );

  }



  if (error && !userData) {

    return (

      <div className="min-h-screen bg-gradient-to-r from-purple-400 to-indigo-600 flex items-center justify-center">

        <p className="text-red-300 text-2xl">Error: {error}</p>

      </div>

    );

  }



  // El renderizado principal solo debe ocurrir si tenemos datos de usuario

  if (!userData) return null;



  // Añadir esta constante para verificar si el usuario es admin

  const isAdmin = userData?.role?.toLowerCase() === 'admin';



  return (

    <div className="min-h-screen bg-gradient-to-r from-purple-400 to-indigo-600">

      <Navbar />

      <div className="container mx-auto p-4">

        <h2 className="text-4xl font-bold text-white mb-6">Mi Perfil</h2>

       

        {/* Información del Usuario */}

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">

          <div className="flex justify-between items-center mb-4">

            <h3 className="text-2xl font-semibold text-gray-800">Información del Usuario</h3>

            {!isAdmin && ( // Solo mostrar el botón editar si NO es admin

              <button

                onClick={() => setIsEditing(!isEditing)}

                className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded"

              >

                {isEditing ? 'Cancelar' : 'Editar Perfil'}

              </button>

            )}

          </div>

         

          {/* Mostrar el formulario de edición solo si no es admin y está en modo edición */}

          {isEditing && !isAdmin ? (

            <form onSubmit={handleProfileSubmit} className="space-y-4">

              <div>

                <label className="block text-gray-700 mb-1">Nombre:</label>

                <input

                  type="text"

                  name="nombre"

                  value={profileForm.nombre}

                  onChange={handleProfileChange}

                  className="w-full p-2 border border-gray-300 rounded"

                />

              </div>

              <div>

                <label className="block text-gray-700 mb-1">Apellido:</label>

                <input

                  type="text"

                  name="apellido"

                  value={profileForm.apellido}

                  onChange={handleProfileChange}

                  className="w-full p-2 border border-gray-300 rounded"

                />

              </div>

              <div>

                <label className="block text-gray-700 mb-1">Correo electrónico:</label>

                <input

                  type="email"

                  name="correo"

                  value={profileForm.correo}

                  onChange={handleProfileChange}

                  className="w-full p-2 border border-gray-300 rounded"

                />

              </div>

              <div className="flex justify-end gap-3 mt-4">

                <button

                  type="button"

                  onClick={() => setIsEditing(false)}

                  className="profile-btn profile-btn-secondary"

                >

                  Cancelar

                </button>

                <button

                  type="submit"

                  className="profile-btn"

                >

                  Guardar Cambios

                </button>

              </div>

            </form>

          ) : (

            <div className="space-y-2">

              <p className="text-gray-700 mb-2"><span className="font-bold">Usuario:</span> {userData?.username || 'No disponible'}</p>

              <p className="text-gray-700 mb-2"><span className="font-bold">Nombre:</span> {userData?.nombre || 'No especificado'}</p>

              <p className="text-gray-700 mb-2"><span className="font-bold">Apellido:</span> {userData?.apellido || 'No especificado'}</p>

              <p className="text-gray-700 mb-2"><span className="font-bold">Correo:</span> {userData?.correo || 'No especificado'}</p>

              <p className="text-gray-700">

                <span className="font-bold">Rol:</span> {

                  (() => {

                    if (!userData || !userData.role) return 'No especificado';

                   

                    // Normalizar el rol a minúsculas para comparaciones consistentes

                    const role = userData.role.toLowerCase();

                   

                    // Mapeo de roles a nombres más amigables

                    const roleNames = {

                      'admin': 'Administrador',

                      'organizador': 'Organizador',

                      'usuario': 'Usuario Regular'

                    };

                   

                    // Retornar el nombre amigable o un valor por defecto

                    return roleNames[role as keyof typeof roleNames] || 'Usuario Regular';

                  })()

                }

              </p>

             

              {/* Añadir mensaje explicativo para los administradores */}

              {isAdmin && (

                <p className="mt-4 p-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-md">

                  <span className="font-bold">Nota:</span> Como administrador, tu perfil no puede ser modificado desde esta interfaz por motivos de seguridad.

                </p>

              )}

            </div>

          )}

         

          {/* Botón para eliminar cuenta, solo visible para usuarios normales */}

          {!isAdmin && (

            <div className="mt-6 pt-4 border-t border-gray-200">

              <button

                onClick={handleDeleteAccount}

                className="profile-btn profile-btn-delete"

              >

                Eliminar mi cuenta

              </button>

              <p className="text-sm text-gray-500 mt-2">Esta acción es permanente y no se puede deshacer.</p>

            </div>

          )}

        </div>



        {/* Mis Eventos Registrados */}

        <h3 className="text-3xl font-bold text-white mb-6">Mis Eventos Registrados</h3>

        {userEventos.length === 0 ? (

          <p className="text-white text-lg">Aún no te has registrado en ningún evento.</p>

        ) : (

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

            {userEventos.map((evento) => (

              <EventoCard

                key={evento.id}

                evento={evento}

                onUnregisterClick={handleUnregisterClick}

                isRegistered={true}

              />

            ))}

          </div>

        )}

      </div>

    </div>

  );

};



export default Profile;