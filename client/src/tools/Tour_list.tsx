// /src/tools/Tour_list.tsx

import { TouristSpot } from "../api/FetchTourApi";
import TouristSpotItem from "./TouristSpotItem";

interface TouristSpotListProps {
  spots: TouristSpot[];
  planId: string | null; 
  visitDay: string | null;
}

export default function TouristSpotList({ spots, planId, visitDay }: TouristSpotListProps) {
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
        />
      ))}
    </div>
  );
}