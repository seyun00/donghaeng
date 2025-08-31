import React from 'react';

// 인터페이스 이름 및 속성 변경
export interface Region {
  id: number;
  regionCode: number;
  regionName: string;
}

interface AreaButtonProps {
  region: Region;
  onClick: () => void;
  isActive: boolean;
}

const AreaButton: React.FC<AreaButtonProps> = ({ region, onClick, isActive }) => {
  const baseClasses = "py-2 px-4 rounded-lg font-semibold transition-colors duration-200 ease-in-out shadow-sm";
  const activeClasses = "bg-indigo-600 text-white";
  const inactiveClasses = "bg-gray-200 text-gray-700 hover:bg-gray-300";

  return (
    <button
      className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}
      onClick={onClick}
    >
      {region.regionName}
    </button>
  );
};

export default AreaButton;