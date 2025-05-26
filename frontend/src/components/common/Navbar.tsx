import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { isAuthenticated, isAdmin, clearAuthData, getUserData } from '../../services/authService';
import '../../assets/styles/Navbar.css';

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const loggedIn = isAuthenticated();
  const userIsAdmin = isAdmin();
  const userData = getUserData(); // Para obtener el username

  const handleLogout = () => {
    clearAuthData(); // Elimina el token y los datos del usuario
    navigate('/login'); // Redirige al login
    // Opcional: recargar la página para limpiar completamente el estado de React
    // window.location.reload(); 
  };

  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <Link to="/">
          <img src="/vite.svg" alt="Logo" className="h-8 w-auto" /> {/* Ejemplo de logo. Asegúrate de tener vite.svg en public/ */}
        </Link>
      </div>
      <div className="navbar-buttons">
        {loggedIn ? (
          <>
            {userIsAdmin ? (
              // Enlaces para administradores
              <>
                <Link to="/home-admin" className="navbar-button">Panel Admin</Link>
                <Link to="/eventos/nuevo-evento" className="navbar-button">Crear Evento</Link>
                <Link to="/admin/cambiar-roles" className="navbar-button">Cambiar Roles</Link>
                <Link to="/perfil" className="navbar-button">Perfil</Link>
              </>
            ) : (
              // Enlaces para usuarios comunes
              <>
                <Link to="/home-usuario" className="navbar-button">Inicio</Link>
                <Link to="/eventos" className="navbar-button">Eventos</Link>
                <Link to="/mis-hitos" className="navbar-button">Mis Hitos</Link> {/* <-- NUEVO ENLACE */}
                <Link to="/perfil" className="navbar-button">Perfil</Link>
              </>
            )}
            {userData && <span className="navbar-username">Hola, {userData.username}!</span>} {/* Muestra el nombre de usuario */}
            <button onClick={handleLogout} className="navbar-button logout-button">
              Cerrar Sesión
            </button>
          </>
        ) : (
          // Enlaces para usuarios no logueados
          <>
            <Link to="/login" className="navbar-button">Iniciar Sesión</Link>
            <Link to="/register" className="navbar-button">Registrarse</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;