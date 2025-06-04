export interface contentsType {
  typeID : number;
  typeName: string;
}

interface contentsTypeButtonProps extends contentsType {
  onClick : () => void;
}

export const contentsTypeList : contentsType[] = [
  {typeID : 12, typeName : "관광지"},
  {typeID : 14, typeName : "문화시설"},
  {typeID : 15, typeName : "행사/공연/축제"},
  {typeID : 25, typeName : "여행코스"},
  {typeID : 28, typeName : "레포츠"},
  {typeID : 32, typeName : "숙박"},
  {typeID : 38, typeName : "쇼핑"},
  {typeID : 39, typeName : "음식점"},
]

export default function ContentsTypeButton ({typeID, typeName, onClick} : contentsTypeButtonProps) 
{
  return (
    <button onClick={onClick}>
      {typeName}
    </button>
  )
}