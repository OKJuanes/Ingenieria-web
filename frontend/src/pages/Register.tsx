import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { API_URL } from '../main.tsx';
import Navbar from "../components/common/Navbar.tsx";
import '../assets/styles/Register.css'; // Importa el archivo CSS para los estilos
import { register } from '../services/authService'; // Importar la función register del servicio

function Register() {
    const [correo, setCorreo] = useState('');
    const [nombre, setNombre] = useState('');
    const [apellido, setApellido] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => { // Usar React.FormEvent
        e.preventDefault();
        setErrorMessage(''); // Limpiar mensajes de error previos
        setSuccessMessage(''); // Limpiar mensajes de éxito previos

        try {
            const userData = await register(correo, nombre, apellido, username, password); // Llamar a la función de registro
            setSuccessMessage(`¡Registro exitoso para ${userData.username}!`);
            
            // Redirigir directamente al home de usuario o a la página de eventos
            navigate('/eventos'); // O donde desees que vaya el usuario después del registro
        } catch (error: any) {
            setErrorMessage(error.message || 'Error en el registro. Por favor, intenta de nuevo.');
            console.error('Error de registro:', error);
        }
    };

    return (
        <div className="main-container">
            <Navbar />
            <div className="welcome">
                <div className="auth-container">
                    <h2>Regístrate</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <span className="form-label">Nombre</span>
                            <input
                                type="text"
                                className="form-control"
                                value={nombre}
                                onChange={(e) => setNombre(e.target.value)}
                                required
                            />
                        </div>
                        <div className="mb-3">
                            <span className="form-label">Apellido</span>
                            <input
                                type="text"
                                className="form-control"
                                value={apellido}
                                onChange={(e) => setApellido(e.target.value)}
                                required
                            />
                        </div>
                        <div className="mb-3">
                            <span className="form-label">Correo</span>
                            <input
                                type="email"
                                className="form-control"
                                value={correo}
                                onChange={(e) => setCorreo(e.target.value)}
                                required
                            />
                        </div>
                        <div className="mb-3">
                            <span className="form-label">Usuario</span>
                            <input
                                type="text"
                                className="form-control"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                        </div>
                        <div className="mb-3">
                            <span className="form-label">Contraseña</span>
                            <input
                                type="password"
                                className="form-control"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <button type="submit" className="btn btn-primary">Registrarse</button>
                        <div className="login-link">
                            <p>
                                ¿Ya estás registrado?{' '}
                                <Link to="/Login">Inicia sesión</Link>
                            </p>
                        </div>
                    </form>

                    {errorMessage && <p className="error-message">{errorMessage}</p>}
                    {successMessage && <p className="success-message">{successMessage}</p>}
                </div>
            </div>
        </div>
    );
}

export default Register;