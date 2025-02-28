import React from 'react';
import { Link } from 'react-router-dom';
import '../../assets/styles/Navbar.css'; 

const Navbar: React.FC = () => {
  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <Link to="/">Logo</Link> {/* imagem */}
      </div>
      <div className="navbar-buttons">
        <Link to="/home-usuario" className="navbar-button">Inicio</Link>
        <Link to="/eventos" className="navbar-button">Eventos</Link>
        <Link to="/perfil" className="navbar-button">Perfil</Link>
        <Link to="/logout" className="navbar-button">Cerrar Sesión</Link>
      </div>
    </nav>
  );
};

export default Navbar;