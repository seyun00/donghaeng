import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import TourDetail from '../tools/TourDetail';
import { FetchDetailCommonInfo, FetchIntroInfo, FetchRepeatInfo } from '../api/FetchTourApi';

const TourDetailPage = () => {
  const { contentId, contentTypeId } = useParams();
  const [common, setCommon] = useState(null);
  const [intro, setIntro] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!contentId || !contentTypeId) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const commonData = await FetchDetailCommonInfo(contentId, contentTypeId);
        const introData = await FetchIntroInfo(contentId, contentTypeId);
        const repeatData = await FetchRepeatInfo(contentId, contentTypeId);

        setCommon(commonData);
        setIntro(introData);
        setRooms(repeatData);
      } catch (error) {
        console.error("상세 정보 로딩 실패", error);
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
      <TourDetail common={common} intro={intro || undefined} rooms={rooms} />
    </div>
  );
};

export default TourDetailPage;
