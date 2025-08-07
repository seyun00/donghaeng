import React from 'react';

export interface Area {
  id: number;
  areaCode: number;
  areaName: string;
}

interface AreaButtonProps {
  area: Area;
  onClick: () => void;
  isActive: boolean;
}

const AreaButton: React.FC<AreaButtonProps> = ({ area, onClick, isActive }) => {
  const baseClasses = "py-2 px-4 rounded-lg font-semibold transition-colors duration-200 ease-in-out shadow-sm";
  const activeClasses = "bg-indigo-600 text-white";
  const inactiveClasses = "bg-gray-200 text-gray-700 hover:bg-gray-300";

  return (
    <button
      className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}
      onClick={onClick}
    >
      {area.areaName}
    </button>
  );
};

export default AreaButton;