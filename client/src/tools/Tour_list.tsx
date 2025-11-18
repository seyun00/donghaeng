// /src/tools/Tour_list.tsx

import { TouristSpot, CategoryMap } from "../api/FetchTourApi";
import TouristSpotItem from "./TouristSpotItem";

interface TouristSpotListProps {
  spots: TouristSpot[];
  planId: string | null;
  visitDay: string | null;
  categoryMap: CategoryMap;
}

export default function TouristSpotList({ spots, planId, visitDay, categoryMap }: TouristSpotListProps) {
  if (spots.length === 0) {
    return <p className="py-10 text-center text-gray-500">결과가 없습니다.</p>;
  }

  // ★ 한 줄에 3개로 제한, 카드 폭 넓힘
  return (
    <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
      {spots.map((spot) => (
        <TouristSpotItem
          key={spot.id}
          spot={spot}
          planId={planId}
          visitDay={visitDay}
          categoryMap={categoryMap}
        />
      ))}
    </div>
  );
}
