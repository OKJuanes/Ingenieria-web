// src/components/common/Button.tsx
import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

const Button: React.FC<ButtonProps> = ({ children, onClick, className }) => {
  return (
    <button
      onClick={onClick}
      className={`px-6 py-2 rounded-lg font-bold text-white bg-purple-600 hover:bg-purple-700 transition-colors ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;