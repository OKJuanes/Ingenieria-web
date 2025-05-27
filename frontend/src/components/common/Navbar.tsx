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
    <nav className="navbar navbar-main">
      <div className="navbar-content">
        <div className="navbar-logo">
          <Link to="/">
            <img src="/vite.svg" alt="Logo" className="navbar-logo-img" />
          </Link>
        </div>
        <div className="navbar-links">
          {loggedIn ? (
            userIsAdmin ? (
              <>
                <Link to="/home-admin" className="navbar-link">Panel Admin</Link>
                <Link to="/eventos/nuevo-evento" className="navbar-link">Crear Evento</Link>
                <Link to="/admin/cambiar-roles" className="navbar-link">Cambiar Roles</Link>
                <Link to="/admin/anadir-invitado" className="navbar-link">Añadir Invitado</Link>
                <Link to="/perfil" className="navbar-link">Perfil</Link>
                <Link to="/eventos" className="navbar-link">Eventos</Link>
              </>
            ) : (
              <>
                <Link to="/home-usuario" className="navbar-link">Inicio</Link>
                <Link to="/eventos" className="navbar-link">Eventos</Link>
                <Link to="/mis-hitos" className="navbar-link">Mis Hitos</Link>
                <Link to="/perfil" className="navbar-link">Perfil</Link>
              </>
            )
          ) : (
            <>
              <Link to="/login" className="navbar-link">Iniciar Sesión</Link>
              <Link to="/register" className="navbar-link">Registrarse</Link>
            </>
          )}
        </div>
        <div className="navbar-user">
          {loggedIn && userData && (
            <>
              <div className="navbar-avatar">
                {userData.username.charAt(0).toUpperCase()}
              </div>
              <span className="navbar-username">Hola, {userData.username}!</span>
              <button onClick={handleLogout} className="navbar-link logout-btn">
                Cerrar Sesión
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;