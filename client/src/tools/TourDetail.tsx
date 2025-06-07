import React from 'react';

// 타입 정의
interface CommonInfo {
  title: string;
  overview?: string;
  homepage?: string;
  tel?: string;
  addr1?: string;
  firstimage?: string;
}

interface IntroInfo {
  accomcountlodging?: string;
  checkintime?: string;
  checkouttime?: string;
  roomcount?: string;
  parkinglodging?: string;
  infocenterlodging?: string;
  scale?: string;
  subfacility?: string;
}

interface RoomInfo {
  roomtitle: string;
  roomcount: string;
  roomsize1: string;
  roomoffseasonminfee1: string;
  roompeakseasonminfee1: string;
  roomintro?: string;
}

interface TourDetailProps {
  common: CommonInfo;
  intro?: IntroInfo;
  rooms?: RoomInfo[];
}

const TourDetail: React.FC<TourDetailProps> = ({ common, intro, rooms }) => {
  return (
    <div className="p-6 bg-white rounded-xl shadow space-y-6">
      {/* 공통 정보 */}
      <div>
        <h2 className="text-2xl font-bold">{common.title}</h2>
        <p className="text-gray-600">{common.addr1}</p>
        {common.firstimage && (
          <img src={common.firstimage} alt={common.title} className="w-full h-64 object-cover mt-4 rounded-md" />
        )}
        <p className="mt-4 text-gray-700">{common.overview}</p>
        {common.homepage && (
          <a href={common.homepage} className="text-blue-600 underline mt-2 block" target="_blank" rel="noopener noreferrer">
            홈페이지 바로가기
          </a>
        )}
      </div>

      {/* 소개 정보 */}
      {intro && (
        <div>
          <h3 className="text-xl font-semibold mt-6">숙소 소개</h3>
          <ul className="mt-2 text-sm text-gray-700 space-y-1">
            <li>총 수용 인원: {intro.accomcountlodging}</li>
            <li>객실 수: {intro.roomcount}</li>
            <li>체크인: {intro.checkintime}</li>
            <li>체크아웃: {intro.checkouttime}</li>
            <li>주차 가능 여부: {intro.parkinglodging}</li>
            <li>건물 규모: {intro.scale}</li>
            <li>부대시설: {intro.subfacility}</li>
          </ul>
        </div>
      )}

      {/* 반복 정보 */}
      {rooms && rooms.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold mt-6">객실 정보</h3>
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

export default TourDetail;
