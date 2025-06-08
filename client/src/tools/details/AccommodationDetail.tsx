import React from 'react';

// 숙박 소개 정보 타입
interface IntroInfo {
  accomcountlodging?: string;
  checkintime?: string;
  checkouttime?: string;
  roomcount?: string;
  parkinglodging?: string;
  scalelodging?: string; // API 필드명에 맞게 수정 (scale -> scalelodging)
  subfacility?: string;
}

// 객실 정보 타입
export interface RoomInfo {
  roomtitle: string;
  roomcount: string;
  roomsize1: string;
  roomoffseasonminfee1: string;
  roompeakseasonminfee1: string;
  roomintro?: string;
}

interface AccommodationDetailProps {
  intro?: IntroInfo;
  rooms?: RoomInfo[];
}

const AccommodationDetail: React.FC<AccommodationDetailProps> = ({ intro, rooms }) => {
  return (
    <div>
      {/* 소개 정보 */}
      {intro && (
        <div>
          <h3 className="text-xl font-semibold mt-6">숙소 소개</h3>
          <ul className="mt-2 text-sm text-gray-700 space-y-1">
            {intro.accomcountlodging && <li>총 수용 인원: {intro.accomcountlodging}</li>}
            {intro.roomcount && <li>객실 수: {intro.roomcount}</li>}
            {intro.checkintime && <li>체크인: {intro.checkintime}</li>}
            {intro.checkouttime && <li>체크아웃: {intro.checkouttime}</li>}
            {intro.parkinglodging && <li>주차 가능 여부: {intro.parkinglodging}</li>}
            {intro.scalelodging && <li>건물 규모: {intro.scalelodging}</li>}
            {intro.subfacility && <li>부대시설: {intro.subfacility}</li>}
          </ul>
        </div>
      )}

      {/* 반복 정보 (객실) */}
      {rooms && rooms.length > 0 && (
        <div className="mt-6">
          <h3 className="text-xl font-semibold">객실 정보</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            {rooms.map((room, idx) => (
              <div key={idx} className="border rounded-lg p-4 shadow-sm">
                <h4 className="font-bold">{room.roomtitle}</h4>
                <p>면적: {room.roomsize1}</p>
                <p>객실 수: {room.roomcount}</p>
                <p>비수기 요금: {room.roomoffseasonminfee1}원</p>
                <p>성수기 요금: {room.roompeakseasonminfee1}원</p>
                {room.roomintro && <p className="text-sm mt-1 text-gray-600">{room.roomintro}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AccommodationDetail;