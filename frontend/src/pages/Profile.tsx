// src/pages/Profile.tsx
import React from 'react';
import { MisEventos } from '../components/eventos/MisEventos'; // Importación corregida

const Profile: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-400 to-indigo-600 p-4">
      <h2 className="text-4xl font-bold text-white mb-4">Perfil</h2>
      <MisEventos /> {/* Uso del componente */}
    </div>
  );
};

export default Profile;