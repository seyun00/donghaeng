import React from 'react';

export interface contentsType {
  typeID: number;
  typeName: string;
}

interface contentsTypeButtonProps extends contentsType {
  onClick: () => void;
  isActive: boolean;
  className?: string; 
}

export const contentsTypeList: contentsType[] = [
  { typeID: 12, typeName: "관광지" },
  { typeID: 14, typeName: "문화시설" },
  { typeID: 15, typeName: "행사/공연/축제" },
  { typeID: 25, typeName: "여행코스" },
  { typeID: 28, typeName: "레포츠" },
  { typeID: 32, typeName: "숙박" },
  { typeID: 38, typeName: "쇼핑" },
  { typeID: 39, typeName: "음식점" },
];

const ContentsTypeButton: React.FC<contentsTypeButtonProps> = ({
  typeID,
  typeName,
  onClick,
  isActive,
  className,
}) => {
  const baseClasses =
    "py-2 px-4 rounded-lg font-semibold transition-colors duration-200 ease-in-out shadow-sm";
  const activeClasses = "bg-indigo-600 text-white";
  const inactiveClasses = "bg-gray-200 text-gray-700 hover:bg-gray-300";
  // className prop 주면 커스텀, 아니면 기본
  const btnClass = className
    ? `${baseClasses} ${isActive ? activeClasses : inactiveClasses} ${className}`
    : `${baseClasses} ${isActive ? activeClasses : inactiveClasses}`;

  return (
    <button className={btnClass} onClick={onClick}>
      {typeName}
    </button>
  );
};

export default ContentsTypeButton;
