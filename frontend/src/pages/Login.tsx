// src/pages/Login.tsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { API_URL } from '../main.tsx';
import '../assets/styles/Login.css'; // Ruta corregida
import { login } from '../services/authService'; // Importar la función login del servicio de autenticación
import '../assets/styles/global.css';
function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => { // Usar React.FormEvent para mejor tipado
    e.preventDefault();
    setErrorMessage(''); // Limpiar mensajes de error previos

    try {
      const userData = await login(username, password);
      console.log("Login exitoso, datos recibidos:", userData);
      console.log("Rol del usuario:", userData.role);

      // Modificación aquí: compara en minúsculas o usa una condición más flexible
      const roleLower = userData.role?.toLowerCase();
      
      if (roleLower === 'admin') {
        console.log("Redirigiendo a panel admin...");
        navigate('/home-admin');
      } else {
        // Asume que cualquier otro rol es un usuario normal
        console.log("Redirigiendo a panel usuario...");
        navigate('/home-usuario');
      }
    } catch (error: any) { // Usar any para el error o tipar si conoces la estructura
      setErrorMessage(error.message || 'Error al iniciar sesión. Inténtalo de nuevo.');
      console.error('Error de login:', error);
    }
  };


  return (
    <div className="login-container">
      {/* Eliminamos la Navbar del Login */}
      <div className="login-box">
        <h2 className="login-title">Iniciar Sesión</h2>
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label>Usuario:</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Contraseña:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="login-button">
            Iniciar Sesión
          </button>
          <div className="login-link">
            <p>
              ¿No tienes una cuenta?{' '}
              <Link to="/register">Regístrate</Link>
            </p>
          </div>
          {errorMessage && (
            <p className="error-message">{errorMessage}</p>
          )}
        </form>
      </div>
    </div>
  );
}

export default Login;