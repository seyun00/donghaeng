import React from 'react';

// 음식점 소개 정보 타입
interface IntroInfo {
  firstmenu?: string;
  treatmenu?: string;
  opentimefood?: string;
  restdatefood?: string;
  parkingfood?: string;
  kidsfacility?: string;
}

interface RestaurantDetailProps {
  intro?: IntroInfo;
}

const RestaurantDetail: React.FC<RestaurantDetailProps> = ({ intro }) => {
  if (!intro) return null;

  return (
    <div>
      <h3 className="text-xl font-semibold mt-6">음식점 정보</h3>
      <ul className="mt-2 text-sm text-gray-700 space-y-1">
        {intro.firstmenu && <li>대표 메뉴: {intro.firstmenu}</li>}
        {intro.treatmenu && <li>취급 메뉴: {intro.treatmenu}</li>}
        {intro.opentimefood && <li>영업 시간: {intro.opentimefood}</li>}
        {intro.restdatefood && <li>쉬는 날: {intro.restdatefood}</li>}
        {intro.parkingfood && <li>주차 시설: {intro.parkingfood}</li>}
        {intro.kidsfacility === '1' && <li>어린이 놀이방 있음</li>}
      </ul>
    </div>
  );
};

export default RestaurantDetail;