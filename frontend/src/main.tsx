// src/main.tsx
import { createRoot } from 'react-dom/client';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Navigate } from 'react-router-dom';

// Importa las páginas principales
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';

// Importa páginas de usuario
import HomeUsuario from './pages/HomeUsuario';
import MisHitos from './pages/MisHitos';

// Importa páginas de administrador
import HomeAdmin from './pages/HomeAdmin';
import AdminHitos from './pages/AdminHitos';
import CambiarRoles from './pages/CambiarRoles';
import AnadirInvitado from './pages/AnadirInvitado';
import HistoricoEventos from './pages/HistoricoEventos';
import HistoricoHitos from './pages/HistoricoHitos';

// Importa páginas de eventos
import Eventos from './pages/Eventos';
import EventoView from './pages/EventoView';
import NuevoEvento from './pages/NuevoEvento';
import EditarEvento from './pages/EditarEvento';

// Importa el componente de ruta protegida
import ProtectedRoute from './components/common/ProtectedRoute';

// Configura la URL de la API
export const API_URL = import.meta.env.VITE_API_URL;

// Configura el enrutador
const router = createBrowserRouter([
  // Redirección raíz
  {
    path: '/',
    element: <Navigate to="/login" replace />,
  },

  // Rutas públicas
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/register',
    element: <Register />,
  },

  // Perfil de usuario (requiere autenticación)
  {
    path: '/perfil',
    element: (
      <ProtectedRoute>
        <Profile />
      </ProtectedRoute>
    ),
  },

  // Rutas de usuario
  {
    path: '/home-usuario',
    element: (
      <ProtectedRoute>
        <HomeUsuario />
      </ProtectedRoute>
    ),
  },
  {
    path: '/mis-hitos',
    element: (
      <ProtectedRoute>
        <MisHitos />
      </ProtectedRoute>
    ),
  },

  // Rutas de administrador
  {
    path: '/home-admin',
    element: (
      <ProtectedRoute>
        <HomeAdmin />
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/hitos',
    element: (
      <ProtectedRoute>
        <AdminHitos />
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/cambiar-roles',
    element: (
      <ProtectedRoute>
        <CambiarRoles />
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/anadir-invitado',
    element: (
      <ProtectedRoute>
        <AnadirInvitado />
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/historico-eventos',
    element: (
      <ProtectedRoute>
        <HistoricoEventos />
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/historico-hitos',
    element: (
      <ProtectedRoute>
        <HistoricoHitos />
      </ProtectedRoute>
    ),
  },

  // Rutas de eventos (accesibles según permisos)
  {
    path: '/eventos',
    element: (
      <ProtectedRoute>
        <Eventos />
      </ProtectedRoute>
    ),
  },
  {
    path: '/eventos/:id',
    element: (
      <ProtectedRoute>
        <EventoView />
      </ProtectedRoute>
    ),
  },
  {
    path: '/eventos/nuevo-evento',
    element: (
      <ProtectedRoute>
        <NuevoEvento />
      </ProtectedRoute>
    ),
  },
  {
    path: '/editar-evento/:id',
    element: (
      <ProtectedRoute>
        <EditarEvento />
      </ProtectedRoute>
    ),
  },
]);

// Renderiza la aplicación
createRoot(document.getElementById('root')!).render(
  <RouterProvider router={router} />
);