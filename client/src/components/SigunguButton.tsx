export interface Sigungu {
  id: number;
  sigunguCode: number;
  sigunguName: string;
}

export default function SigunguButton({ sigungu, onClick }: 
  {
  sigungu: Sigungu; 
  onClick: () => void;
  }) {
  return (
    <button onClick={onClick}>
      {sigungu.sigunguName}
    </button>
  )
}