import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { API_URL } from '../main.tsx';
import Navbar from "../components/common/Navbar.tsx";
import '../assets/styles/Register.css'; // Importa el archivo CSS para los estilos

function Register() {
    const [correo, setCorreo] = useState('');
    const [nombre, setNombre] = useState('');
    const [apellido, setApellido] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const navigate = useNavigate();

    const handleSubmit = async (e: { preventDefault: () => void; }) => {
        e.preventDefault();

        // Crear el cuerpo del POST
        const requestBody = {
            correo: correo,
            nombre: nombre,
            apellido: apellido,
            username: username,
            password: password
        };

        try {
            // Realizar el POST al backend
            const response = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });

            if (response.ok) {
                // Si la respuesta es exitosa (por ejemplo, 200), manejar el éxito
                const { token } = await response.json();
                setSuccessMessage(`Registro exitoso!`);
                setErrorMessage('');
                // Almacenar el token JWT y redirigir a la página de eventos
                localStorage.setItem('authToken', token);
                navigate('/eventos');
            } else {
                // Si hay algún error, manejar el error
                const errorData = await response.json();
                setErrorMessage(errorData.message || 'Error en el registro');
                setSuccessMessage('');
            }
        } catch (error) {
            // Manejo de errores en la conexión
            setErrorMessage('Error de conexión. Por favor, intenta más tarde.');
            console.log(error);
            setSuccessMessage('');
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