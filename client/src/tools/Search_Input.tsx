interface SearchInputProps {
  value: string;
  onChange: (text: string) => void;
  className?: string;            // 추가
  placeholder?: string;          // 추가
}

export default function SearchInput({
  value,
  onChange,
  className = "",
  placeholder = "관광지 이름 검색",
}: SearchInputProps) {
  return (
    <input
      type="text"
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className={`w-full px-5 py-3 text-lg rounded-xl bg-white border border-blue-300 shadow focus:outline-none focus:ring-2 focus:ring-blue-400 transition ${className}`}
    />
  );
}
