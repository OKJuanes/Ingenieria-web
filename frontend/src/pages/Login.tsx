// src/pages/Login.tsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../assets/styles/Login.css';
import { login } from '../services/authService';

function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage(''); // Limpiar mensajes de error previos

        try {
            const userData = await login(username, password);
            
            const roleLower = userData.role?.toLowerCase();
            
            if (roleLower === 'admin') {
                navigate('/home-admin');
            } else {
                // Asume que cualquier otro rol es un usuario normal
                navigate('/home-usuario');
            }
        } catch (error: any) {
            setErrorMessage(error.message || 'Error al iniciar sesión. Inténtalo de nuevo.');
            console.error('Error de login:', error);
        }
    };

    return (
        <div className="login-container">
            {/* Sin Navbar aquí */}
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