import React from 'react';

export interface Sigungu {
  id: number;
  sigunguCode: number;
  sigunguName: string;
}

interface SigunguButtonProps {
  sigungu: Sigungu;
  onClick: () => void;
  isActive: boolean;
  className?: string;                
}

const SigunguButton: React.FC<SigunguButtonProps> = ({ sigungu, onClick, isActive, className }) => {
  const baseClasses = "py-2 px-4 rounded-lg font-semibold transition-colors duration-200 ease-in-out shadow-sm";
  const activeClasses = "bg-indigo-600 text-white";
  const inactiveClasses = "bg-gray-200 text-gray-700 hover:bg-gray-300";

  const btnClass = className
    ? `${baseClasses} ${isActive ? activeClasses : inactiveClasses} ${className}`
    : `${baseClasses} ${isActive ? activeClasses : inactiveClasses}`;
  
  return (
    <button
      className={btnClass}
      onClick={onClick}
    >
      {sigungu.sigunguName}
    </button>
  );
};

export default SigunguButton;
