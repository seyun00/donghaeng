// /src/tools/Tour_list.tsx

import { TouristSpot, CategoryMap } from "../api/FetchTourApi"; // [수정됨] CategoryMap 임포트
import TouristSpotItem from "./TouristSpotItem";

interface TouristSpotListProps {
  spots: TouristSpot[];
  planId: string | null; 
  visitDay: string | null;
  categoryMap: CategoryMap; // [추가됨] 카테고리 맵 prop
}

export default function TouristSpotList({ spots, planId, visitDay, categoryMap }: TouristSpotListProps) {
  if (spots.length === 0) {
    return <p className="text-center text-gray-500 py-10">결과가 없습니다.</p>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {spots.map((spot) => (
        <TouristSpotItem 
          key={spot.id} 
          spot={spot} 
          planId={planId} 
          visitDay={visitDay} 
          categoryMap={categoryMap} // [추가됨] 맵을 아이템으로 전달
        />
      ))}
    </div>
  );
}