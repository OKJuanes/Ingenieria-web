// src/components/common/Input.tsx
import React from "react";

interface InputProps {
  type: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
}

const Input: React.FC<InputProps> = ({ type, placeholder, value, onChange, className }) => {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={`px-4 py-2 border-2 border-purple-400 rounded-lg focus:outline-none focus:border-purple-600 ${className}`}
    />
  );
};

export default Input;