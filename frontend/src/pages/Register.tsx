import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
// Eliminamos la importación de Navbar
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage('');
        setSuccessMessage('');
        
        // Validaciones básicas
        if (!correo || !nombre || !apellido || !username || !password) {
            setErrorMessage('Todos los campos son obligatorios');
            return;
        }
        
        // Validación de correo electrónico
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(correo)) {
            setErrorMessage('Por favor, ingresa un correo electrónico válido');
            return;
        }
        
        try {
            const userData = await register(correo, nombre, apellido, username, password);
            setSuccessMessage(`¡Registro exitoso para ${userData.username}!`);    
            console.log("Registro exitoso:", userData);
            
            // Redirigir después de 1.5 segundos para que el usuario vea el mensaje de éxito
            setTimeout(() => navigate('/login'), 1500);
        } catch (error: any) {
            console.error("Error de registro:", error);
            
            // Manejo específico para usuarios duplicados
            if (error.message.includes('ya está en uso') || 
                error.message.includes('duplicate') || 
                error.message.includes('already exists')) {
                setErrorMessage('El nombre de usuario o correo ya está registrado. Por favor usa otro.');
            } else {
                setErrorMessage(`Error al registrar: ${error.message}`);
            }
        }
    };

    return (
        <div className="main-container">
            {/* Eliminamos el componente Navbar */}
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

                    {errorMessage && (
                      <div className="error-message p-3 my-2 bg-red-100 text-red-700 rounded-md">
                        {errorMessage}
                      </div>
                    )}
                    {successMessage && <p className="success-message">{successMessage}</p>}
                </div>
            </div>
        </div>
    );
}

export default Register;