// /src/tools/TouristSpotItem.tsx

import React from 'react';
import { TouristSpot, CategoryMap } from "../api/FetchTourApi";

interface TouristSpotItemProps {
  spot: TouristSpot;
  planId: string | null;
  visitDay: string | null;
  categoryMap: CategoryMap; 
}

const TouristSpotItem: React.FC<TouristSpotItemProps> = ({ spot, planId, visitDay, categoryMap }) => {
  let detailUrl = `/detail/${spot.id}/${spot.contentTypeId}`;
  if (planId) {
    detailUrl += `?planId=${planId}`;
    if (visitDay) {
      detailUrl += `&day=${visitDay}`;
    }
  }

  const cat1Name = spot.lclsSystm1 ? categoryMap[spot.lclsSystm1] : null;
  const cat2Name = spot.lclsSystm2 ? categoryMap[spot.lclsSystm2] : null;
  const cat3Name = spot.lclsSystm3 ? categoryMap[spot.lclsSystm3] : null;
  
  const categoryString = [cat1Name, cat2Name, cat3Name].filter(Boolean).join(' > ');

  // contentTypeId가 15(행사/공연/축제)가 아니고, 카테고리 문자열이 있을 때만 표시
  const shouldShowCategory = spot.contentTypeId !== '15' && categoryString;

  return (
    <a 
      href={detailUrl} 
      target="_blank" 
      rel="noopener noreferrer" 
      className="block border rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 ease-in-out bg-white"
    >
      <div className="w-full h-48 bg-gray-200">
        {spot.imageUrl ? (
          <img 
            src={spot.imageUrl} 
            alt={spot.name} 
            className="w-full h-full object-cover" 
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-500">
            이미지 없음
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-800 truncate" title={spot.name}>
          {spot.name}
        </h3>

        <p className="text-sm text-gray-600 mt-1 truncate" title={spot.location}>
            {spot.location}
        </p>
        
        {shouldShowCategory && (
          <p className="text-xs text-indigo-600 font-semibold mt-2 truncate" title={categoryString}>
            {categoryString}
          </p>
        )}
      </div>
    </a>
  );
};

export default TouristSpotItem;