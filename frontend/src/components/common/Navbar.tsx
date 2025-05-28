import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { isAuthenticated, isAdmin, clearAuthData, getUserData } from '../../services/authService';
import '../../assets/styles/Navbar.css';

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const loggedIn = isAuthenticated();
  const userIsAdmin = isAdmin();
  const userData = getUserData();
  const [menuOpen, setMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('darkMode') === 'true';
  });
  const [avatarColor, setAvatarColor] = useState(
    localStorage.getItem("avatarColor") || "#6b21a8"
  );

  useEffect(() => {
    document.body.classList.toggle('dark-mode', darkMode);
    localStorage.setItem('darkMode', darkMode ? 'true' : 'false');
  }, [darkMode]);

  // Escuchar cambios en localStorage para avatarColor
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === "avatarColor") {
        setAvatarColor(e.newValue || "#6b21a8");
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // También actualiza el color si vuelves al perfil y cambias el color (misma pestaña)
  useEffect(() => {
    const interval = setInterval(() => {
      const color = localStorage.getItem("avatarColor") || "#6b21a8";
      setAvatarColor(color);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    clearAuthData();
    navigate('/login');
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <nav className="navbar navbar-main">
      <div className="navbar-content">
        <div className="navbar-logo">
          <Link to="/">
            <img src="/vite.svg" alt="Logo" className="navbar-logo-img" />
          </Link>
        </div>

        {/* Hamburger menu button for mobile */}
        <button 
          className={`navbar-hamburger ${menuOpen ? 'active' : ''}`} 
          onClick={toggleMenu}
          aria-label="Menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        {/* Navigation links */}
        <div className={`navbar-links ${menuOpen ? 'active' : ''}`}>
          {loggedIn ? (
            userIsAdmin ? (
              <>
                <Link to="/home-admin" className="navbar-link" onClick={closeMenu}>Panel Admin</Link>
                <Link to="/eventos/nuevo-evento" className="navbar-link" onClick={closeMenu}>Crear Evento</Link>
                <Link to="/admin/cambiar-roles" className="navbar-link" onClick={closeMenu}>Cambiar Roles</Link>
                <Link to="/admin/anadir-invitado" className="navbar-link" onClick={closeMenu}>Añadir Invitado</Link>
                <Link to="/perfil" className="navbar-link" onClick={closeMenu}>Perfil</Link>
                <Link to="/eventos" className="navbar-link" onClick={closeMenu}>Eventos</Link>
              </>
            ) : (
              <>
                <Link to="/home-usuario" className="navbar-link" onClick={closeMenu}>Inicio</Link>
                <Link to="/eventos" className="navbar-link" onClick={closeMenu}>Eventos</Link>
                <Link to="/mis-hitos" className="navbar-link" onClick={closeMenu}>Mis Hitos</Link>
                <Link to="/perfil" className="navbar-link" onClick={closeMenu}>Perfil</Link>
              </>
            )
          ) : null}
          
          {loggedIn && (
            <div className="navbar-user">
              <div
                className="navbar-avatar"
                style={{ background: avatarColor }}
              >
                {userData?.username.charAt(0).toUpperCase()}
              </div>
              <span className="navbar-username">Hola, {userData?.username}!</span>
              <button onClick={handleLogout} className="navbar-link logout-btn">
                Cerrar Sesión
              </button>
            </div>
          )}
        </div>

        {/* Dark mode toggle button */}
        <button
          className="navbar-darkmode-btn"
          aria-label="Alternar modo oscuro"
          onClick={() => setDarkMode(dm => !dm)}
        >
          {darkMode ? '🌙' : '☀️'}
        </button>
      </div>
    </nav>
  );
};

export default Navbar;