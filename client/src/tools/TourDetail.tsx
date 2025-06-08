import React from 'react';
import AccommodationDetail, { RoomInfo } from '../tools/details/AccommodationDetail';
import RestaurantDetail from '../tools/details/RestaurantDetail';
import TouristSpotDetail from '../tools/details/TouristSpotDetail';
import EventDetail from '../tools/details/EventDetail';
import DefaultDetail from '../tools/details/DefaultDetail';

// 공통 정보 타입 정의
interface CommonInfo {
  title: string;
  overview?: string;
  homepage?: string;
  tel?: string;
  addr1?: string;
  firstimage?: string;
}

// TourDetail 컴포넌트의 Props 타입 정의
interface TourDetailProps {
  contentTypeId: number;
  common: CommonInfo;
  intro: any; // 다양한 타입의 소개 정보가 올 수 있으므로 any로 지정
  rooms?: RoomInfo[]; // 객실 정보는 숙박 타입에만 해당
}

// 상세 정보 컴포넌트를 선택하는 헬퍼 함수
const renderDetail = (props: TourDetailProps) => {
  switch (props.contentTypeId) {
    case 12: // 관광지
      return <TouristSpotDetail intro={props.intro} />;
    case 15: // 행사/공연/축제
      return <EventDetail intro={props.intro} />;
    case 32: // 숙박
      return <AccommodationDetail intro={props.intro} rooms={props.rooms} />;
    case 39: // 음식점
      return <RestaurantDetail intro={props.intro} />;
    default:
      // 문화시설, 여행코스, 레포츠, 쇼핑 등은 기본 정보만 표시
      return <DefaultDetail intro={props.intro} />;
  }
};

const TourDetail: React.FC<TourDetailProps> = (props) => {
  const { common } = props;

  return (
    <div className="p-6 bg-white rounded-xl shadow space-y-6">
      {/* 공통 정보 (모든 타입에 공통으로 표시) */}
      <div>
        <h2 className="text-2xl font-bold">{common.title}</h2>
        <p className="text-gray-600">{common.addr1}</p>
        {common.firstimage && (
          <img src={common.firstimage} alt={common.title} className="w-full h-64 object-cover mt-4 rounded-md" />
        )}
        <div className="mt-4 text-gray-700" dangerouslySetInnerHTML={{ __html: common.overview || '' }} />
        {common.homepage && (
          <div
            className="text-blue-600 underline mt-2 block"
            dangerouslySetInnerHTML={{ __html: common.homepage }}
          />
        )}
      </div>

      <hr/>

      {/* 콘텐츠 타입에 따라 다른 상세 정보 렌더링 */}
      {props.intro && renderDetail(props)}
      
    </div>
  );
};

export default TourDetail;