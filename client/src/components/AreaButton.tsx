export interface Area {
  id: number;
  areaCode: number;
  areaName: string;
}

export default function AreaButton({ area, onClick }: 
  {
  area: Area; 
  onClick: () => void;
  }) {
  return (
    <button onClick={onClick}>
      {area.areaName}
    </button>
  )
}