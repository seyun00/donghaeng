import React from 'react';
import GenericDetail from './GenericDetail';

export interface RoomInfo {
  roomtitle: string;
  roomcount: string;
  roomsize1: string;
  roomoffseasonminfee1: string;
  roompeakseasonminfee1:string;
  roomintro?: string;
}

interface AccommodationDetailProps {
  intro?: any;
  rooms?: RoomInfo[];
}

const AccommodationDetail: React.FC<AccommodationDetailProps> = ({ intro, rooms }) => {
  return (
    <>
      <GenericDetail intro={intro} title="숙소 소개" />

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
    </>
  );
};

export default AccommodationDetail;