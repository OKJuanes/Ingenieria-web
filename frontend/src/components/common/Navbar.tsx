import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { isAuthenticated, isAdmin, clearAuthData, getUserData } from '../../services/authService';
import '../../assets/styles/Navbar.css';

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const loggedIn = isAuthenticated();
  const userIsAdmin = isAdmin();
  const userData = getUserData();

  const handleLogout = () => {
    clearAuthData();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <Link to="/">
          <img src="/vite.svg" alt="Logo" className="navbar-logo-img" />
        </Link>
      </div>
      <div className="navbar-links">
        {loggedIn ? (
          <>
            {userIsAdmin ? (
              <>
                <Link to="/home-admin" className="navbar-button">Panel Admin</Link>
                <Link to="/eventos/nuevo-evento" className="navbar-button">Crear Evento</Link>
                <Link to="/admin/cambiar-roles" className="navbar-button">Cambiar Roles</Link>
                <Link to="/perfil" className="navbar-button">Perfil</Link>
              </>
            ) : (
              <>
                <Link to="/home-usuario" className="navbar-button">Inicio</Link>
                <Link to="/eventos" className="navbar-button">Eventos</Link>
                <Link to="/mis-hitos" className="navbar-button">Mis Hitos</Link>
                <Link to="/perfil" className="navbar-button">Perfil</Link>
              </>
            )}
          </>
        ) : (
          <>
            <Link to="/login" className="navbar-button">Iniciar Sesión</Link>
            <Link to="/register" className="navbar-button">Registrarse</Link>
          </>
        )}
      </div>
      <div className="navbar-user">
        {loggedIn && userData && (
          <>
            <div className="navbar-avatar">
              <span>{userData.username.charAt(0).toUpperCase()}</span>
            </div>
            <span className="navbar-username">Hola, {userData.username}!</span>
            <button onClick={handleLogout} className="navbar-button logout-button">
              Cerrar Sesión
            </button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;