// /src/tools/TouristSpotItem.tsx

import React from 'react';
import { TouristSpot } from "../api/FetchTourApi";

interface TouristSpotItemProps {
  spot: TouristSpot;
  planId: string | null;
  visitDay: string | null;
}

const TouristSpotItem: React.FC<TouristSpotItemProps> = ({ spot, planId, visitDay }) => {
  let detailUrl = `/detail/${spot.id}/${spot.contentTypeId}`;
  if (planId) {
    detailUrl += `?planId=${planId}`;
    if (visitDay) {
      detailUrl += `&day=${visitDay}`;
    }
  }

  // 여행코스의 경우 개요정보를 사진 밑에 표시 안하도록 조건 설정함
  const shouldShowDescription = spot.contentTypeId !== '25' && spot.description && spot.description !== '설명 없음';

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
        {/* 설명이 있을 경우에만 태그를 표시 */}
        {shouldShowDescription && (
            <p className="text-sm text-gray-600 mt-1 truncate" title={spot.description}>
                {spot.description}
            </p>
        )}
      </div>
    </a>
  );
};

export default TouristSpotItem;