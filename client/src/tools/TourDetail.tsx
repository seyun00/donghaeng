import React from 'react';
import AccommodationDetail from './details/AccommodationDetail';
import CourseDetail from './details/CourseDetail';
import GenericDetail from './details/GenericDetail';

// --- 인터페이스 정의 ---
interface CommonInfo {
  title: string;
  overview?: string;
  homepage?: string;
  tel?: string;
  addr1?: string;
  firstimage?: string;
}

interface TourDetailProps {
  contentTypeId: number;
  common: CommonInfo;
  intro: any;
  repeatInfo: any[];
}

// --- 컴포넌트 맵 정의 ---
// contentTypeId를 키로 사용하여 렌더링할 컴포넌트와 제목을 매핑합니다.
const detailComponentMap: { [key: number]: { component: React.FC<any>; title: string } } = {
  12: { component: GenericDetail, title: "관광지 정보" },
  14: { component: GenericDetail, title: "문화시설 정보" },
  15: { component: GenericDetail, title: "행사/공연/축제 정보" },
  25: { component: CourseDetail, title: "여행 코스 정보" }, // CourseDetail은 반복정보만 사용하므로 별도 유지
  28: { component: GenericDetail, title: "레포츠 정보" },
  32: { component: AccommodationDetail, title: "숙소 소개" }, // AccommodationDetail은 반복정보(객실) 구조가 특수하여 별도 유지
  38: { component: GenericDetail, title: "쇼핑 정보" },
  39: { component: GenericDetail, title: "음식점 정보" },
};

const TourDetail: React.FC<TourDetailProps> = (props) => {
  const { contentTypeId, common, intro, repeatInfo } = props;

  // 맵에서 현재 contentTypeId에 해당하는 컴포넌트 정보 조회
  const detailInfo = detailComponentMap[contentTypeId];
  // 해당하는 정보가 없으면 기본값으로 GenericDetail 사용
  const DetailComponent = detailInfo?.component || GenericDetail;
  const detailTitle = detailInfo?.title || "추가 정보";
  
  // 각 컴포넌트에 필요한 props를 동적으로 전달
  const detailProps = {
    intro,
    title: detailTitle,
    // AccommodationDetail과 CourseDetail은 repeatInfo를 다른 이름(rooms, repeatInfo)으로 사용
    ...(contentTypeId === 32 && { rooms: repeatInfo }),
    ...(contentTypeId === 25 && { repeatInfo: repeatInfo }),
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow space-y-6">
      {/* 공통 정보 */}
      <div>
        <h2 className="text-2xl font-bold">{common.title}</h2>
        <p className="text-gray-600">{common.addr1}</p>
        {common.firstimage && (
          <img src={common.firstimage} alt={common.title} className="w-full h-64 object-cover mt-4 rounded-md" />
        )}
        <div className="mt-4 text-gray-700" dangerouslySetInnerHTML={{ __html: common.overview || '' }} />
        {common.homepage && (
          <div
            className="text-blue-600 underline mt-2 block break-all"
            dangerouslySetInnerHTML={{ __html: common.homepage }}
          />
        )}
      </div>
      <hr/>
      {/* 콘텐츠 타입에 따라 동적으로 선택된 상세 정보 컴포넌트 렌더링 */}
      <DetailComponent {...detailProps} />
    </div>
  );
};

export default TourDetail;