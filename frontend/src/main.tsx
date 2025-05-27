// src/main.tsx
import { createRoot } from 'react-dom/client';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Navigate } from 'react-router-dom';
import './assets/styles/global.css';
// Importa las páginas
import HomeAdmin from './pages/HomeAdmin';// Página para administradores
import Login from './pages/Login';
import HomeUsuario from './pages/HomeUsuario'; // Página para usuarios comunes
import AdminHitos from './pages/AdminHitos';
import Eventos from './pages/Eventos';
import Profile from './pages/Profile';
import Register from './pages/Register';
import EventoView from './pages/EventoView';
import NuevoEvento from './pages/NuevoEvento';
import CambiarRoles from './pages/CambiarRoles';
import MisHitos from './pages/MisHitos';

// Configura la URL de la API
export const API_URL = import.meta.env.VITE_API_URL;

// Configura el enrutador
const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/login" replace />,
  },
  {
    path: '/login',
    element: <Login />, // La ruta principal ahora es la página de Login
  },
  {
    path: '/home-usuario',
    element: <HomeUsuario />, // Página para usuarios comunes
  },
  {
    path: '/home-admin',
    element: <HomeAdmin />, // Página para administradores
  },
  {
    path: '/admin/hitos', // <-- ¡NUEVA RUTA PARA GESTIÓN DE HITOS!
    element: <AdminHitos />,
  },
  {
    path: '/eventos',
    element: <Eventos />,
  },
  {
    path: '/eventos/:id',
    element: <EventoView />,
  },
  {
    path: '/eventos/nuevo-evento',
    element: <NuevoEvento />,
  },
  {
    path: '/perfil',
    element: <Profile />,
  },
  {
    path: '/register',
    element: <Register />,
  },
  {
    path: '/admin/cambiar-roles',
    element: <CambiarRoles />,
  },
  {
    path: '/mis-hitos',
    element: <MisHitos />,
  },
  
]);

// Renderiza la aplicación
createRoot(document.getElementById('root')!).render(
  <RouterProvider router={router} />
);