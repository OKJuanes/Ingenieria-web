// src/pages/Login.tsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { API_URL } from '../main.tsx';
import '../assets/styles/Login.css'; // Ruta corregida

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const navigate = useNavigate();

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();

    // Crear el cuerpo del POST
    const requestBody = {
      username: username,
      password: password,
    };

    try {
      // Realizar el POST al backend
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error('Credenciales incorrectas');
      }

      // Si la respuesta es exitosa, manejar el éxito
      const { token, role } = await response.json();
      setErrorMessage('');

      // Almacenar el token en localStorage
      localStorage.setItem('authToken', token);

      // Redirigir según el rol
      if (role === 'admin') {
        navigate('/home-admin'); // Redirige al administrador
      } else if (role === 'user') {
        navigate('/home-usuario'); // Redirige al usuario común
      } else {
        throw new Error('Rol no válido');
      }
    } catch (error) {
      // Manejo de errores en la conexión
      setErrorMessage('Usuario o contraseña incorrectos.');
      console.error(error);
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