// src/pages/Home.tsx
import React from 'react';
import Navbar from '../components/common/Navbar';

const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-400 to-indigo-600">
      <Navbar />
      <div className="container mx-auto p-4">
        <h2 className="text-4xl font-bold text-white mb-4">Bienvenido al Sistema de Eventos</h2>
        <p className="text-white text-lg">
          Gestiona eventos académicos y registra hitos destacados de manera fácil y divertida.
        </p>
      </div>
    </div>
  );
};

export default Home;