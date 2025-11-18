import React from 'react';

export interface Region {
  id: number;
  regionCode: number;
  regionName: string;
}

interface AreaButtonProps {
  region: Region;
  onClick: () => void;
  isActive: boolean;
  className?: string;                
}

const AreaButton: React.FC<AreaButtonProps> = ({ region, onClick, isActive, className }) => {
  const baseClasses = "py-2 px-4 rounded-lg font-semibold transition-colors duration-200 ease-in-out shadow-sm";
  const activeClasses = "bg-indigo-600 text-white";
  const inactiveClasses = "bg-gray-200 text-gray-700 hover:bg-gray-300";
  // min/max-width에 따라 상자 크기 자동 조정, 글자 크기 소폭 축소
  
  const btnClass = className
    ? `${baseClasses} min-w-24 max-w-36 ${isActive ? activeClasses : inactiveClasses} ${className}`
    : `${baseClasses} min-w-24 max-w-36 ${isActive ? activeClasses : inactiveClasses}`;
  return (
    <button
      className={btnClass}
      onClick={onClick}
    >
      {region.regionName}
    </button>
  );
};

export default AreaButton;
