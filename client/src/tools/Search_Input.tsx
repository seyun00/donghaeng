interface SearchInputProps {
  value: string;
  onChange: (text: string) => void;
}

export default function SearchInput({ value, onChange }: SearchInputProps) {
  return (
    <input
      type="text"
      placeholder="관광지 이름 검색"
      value={value}
      onChange={e => onChange(e.target.value)}
      style={{ marginLeft: 10 }}
    />
  );
}
export {};