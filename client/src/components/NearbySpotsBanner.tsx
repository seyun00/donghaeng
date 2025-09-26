//src/components/NearbySpotsBanner.tsx

import React, { useState } from 'react';
import { TouristSpot } from '../api/FetchTourApi';

interface NearbySpotsBannerProps {
  popularSpots: TouristSpot[];
  nearbySpots: TouristSpot[];
  currentSpotId: string;
}

const NearbySpotsBanner: React.FC<NearbySpotsBannerProps> = ({ popularSpots, nearbySpots, currentSpotId }) => {
  const [sortOrder, setSortOrder] = useState<'popular' | 'nearby'>('popular');

  const spotsToShow = (sortOrder === 'popular' ? popularSpots : nearbySpots).filter(spot => spot.id !== currentSpotId);

  const baseButtonClasses = "px-4 py-1 text-sm rounded-full transition-colors";
  const activeButtonClasses = "bg-indigo-600 text-white font-semibold";
  const inactiveButtonClasses = "bg-gray-200 text-gray-600 hover:bg-gray-300";
  
  if (spotsToShow.length === 0) {
    return (
        <div className="p-4 bg-white rounded-xl shadow-lg">
            <div className="flex justify-between items-center mb-3">
                <h4 className="text-lg font-bold">이런 관광지는 어때요?</h4>
            </div>
            <div className="text-center py-8 text-gray-500">
                <p>주변 추천 정보를 찾을 수 없습니다.</p>
            </div>
        </div>
    );
  }

  return (
    <div className="p-4 bg-white rounded-xl shadow-lg">
      <div className="flex justify-between items-center mb-3">
        <h4 className="text-lg font-bold">이런 관광지는 어때요?</h4>
        <div className="flex space-x-2">
          <button 
            onClick={() => setSortOrder('popular')}
            className={`${baseButtonClasses} ${sortOrder === 'popular' ? activeButtonClasses : inactiveButtonClasses}`}
          >
            인기순
          </button>
          <button 
            onClick={() => setSortOrder('nearby')}
            className={`${baseButtonClasses} ${sortOrder === 'nearby' ? activeButtonClasses : inactiveButtonClasses}`}
          >
            거리순
          </button>
        </div>
      </div>
      <ul className="space-y-3">
        {spotsToShow.map(spot => (
          <li key={spot.id} className="border-b pb-2 last:border-b-0">
            <a 
              href={`/detail/${spot.id}/${spot.contentTypeId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-3 group"
            >
              <img 
                src={spot.imageUrl || 'https://via.placeholder.com/80x60.png?text=No+Image'} 
                alt={spot.name}
                className="w-16 h-16 object-cover rounded-md"
              />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-800 truncate group-hover:text-blue-600">
                  {spot.name}
                </p>
                <p className="text-sm text-gray-500 truncate">
                  {spot.location}
                </p>
              </div>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default NearbySpotsBanner;