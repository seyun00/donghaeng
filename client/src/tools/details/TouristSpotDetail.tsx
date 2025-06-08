import React from 'react';

// 관광지 소개 정보 타입
interface IntroInfo {
  infocenter?: string;
  restdate?: string;
  expguide?: string;
  usetime?: string;
  parking?: string;
}

interface TouristSpotDetailProps {
  intro?: IntroInfo;
}

const TouristSpotDetail: React.FC<TouristSpotDetailProps> = ({ intro }) => {
  if (!intro) return null;

  return (
    <div>
      <h3 className="text-xl font-semibold mt-6">관광지 정보</h3>
      <ul className="mt-2 text-sm text-gray-700 space-y-1">
        {intro.infocenter && <li>문의 및 안내: {intro.infocenter}</li>}
        {intro.restdate && <li>쉬는 날: {intro.restdate}</li>}
        {intro.expguide && <li>체험 안내: {intro.expguide}</li>}
        {intro.usetime && <li>이용 시간: {intro.usetime}</li>}
        {intro.parking && <li>주차 시설: {intro.parking}</li>}
      </ul>
    </div>
  );
};

export default TouristSpotDetail;