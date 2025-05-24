interface AreaSelectorProps {
  areaCode: number;
  onChange: (code: number) => void;
}

export default function AreaSelector({ areaCode, onChange }: AreaSelectorProps) {
  return (
    <select value={areaCode} onChange={e => onChange(Number(e.target.value))}>
      <option value={1}>서울</option>
      <option value={2}>인천</option>
      <option value={6}>부산</option>
      <option value={31}>경기</option>
      <option value={32}>강원</option>
    </select>
  );
}
export {};