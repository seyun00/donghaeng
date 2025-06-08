import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import TourDetail from '../tools/TourDetail';
import { FetchDetailCommonInfo, FetchIntroInfo, FetchRepeatInfo } from '../api/FetchTourApi';
import { RoomInfo } from '../tools/details/AccommodationDetail'; // RoomInfo 위치 변경

const TourDetailPage = () => {
  const { contentId, contentTypeId } = useParams<{ contentId: string; contentTypeId: string }>();

  const [common, setCommon] = useState<any>(null);
  const [intro, setIntro] = useState<any>(null);
  const [rooms, setRooms] = useState<RoomInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // contentId와 contentTypeId가 유효하지 않으면 API를 호출하지 않습니다.
    if (!contentId || !contentTypeId) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const commonData = await FetchDetailCommonInfo(contentId, contentTypeId);
        const introData = await FetchIntroInfo(contentId, contentTypeId);
        
        // 숙박(32) 타입일 경우에만 객실 정보를 조회합니다.
        if (contentTypeId === '32') {
          const repeatData = await FetchRepeatInfo(contentId, contentTypeId);
          setRooms(Array.isArray(repeatData) ? repeatData : []);
        }

        setCommon(commonData || null);
        setIntro(introData || null);

      } catch (error) {
        console.error("상세 정보 로딩 실패", error);
        // 실패 시 상태 초기화
        setCommon(null);
        setIntro(null);
        setRooms([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [contentId, contentTypeId]);

  if (loading) return <p>로딩 중...</p>;
  
  if (!common) return <p>데이터를 불러올 수 없습니다.</p>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">관광지 상세 정보</h1>
      {/* contentTypeId를 TourDetail 컴포넌트로 넘겨줍니다. */}
      <TourDetail
        contentTypeId={Number(contentTypeId)}
        common={common}
        intro={intro}
        rooms={rooms}
      />
    </div>
  );
};

export default TourDetailPage;