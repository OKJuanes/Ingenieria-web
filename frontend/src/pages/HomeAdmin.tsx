// src/pages/HomeAdmin.tsx
import React from 'react';
import Navbar from '../components/common/Navbar';

const HomeAdmin: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-400 to-indigo-600">
      <Navbar /> {/* La Navbar está presente aquí */}
      <div className="container mx-auto p-4">
        <h2 className="text-4xl font-bold text-white mb-4">Bienvenido, Administrador</h2>
        <p className="text-white text-lg">
          Aquí puedes gestionar todos los eventos y usuarios.
        </p>
      </div>
    </div>
  );
};

export default HomeAdmin;