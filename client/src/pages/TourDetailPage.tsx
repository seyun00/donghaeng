import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import TourDetail from '../tools/TourDetail';
import { FetchDetailCommonInfo, FetchIntroInfo, FetchRepeatInfo } from '../api/FetchTourApi';

const TourDetailPage = () => {
  const { contentId, contentTypeId } = useParams<{ contentId: string; contentTypeId: string }>();

  const [common, setCommon] = useState<any>(null);
  const [intro, setIntro] = useState<any>(null);
  const [repeatInfo, setRepeatInfo] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!contentId || !contentTypeId) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        // Promise.all을 사용해 API 요청을 병렬로 처리
        const [commonData, introData, repeatDataResult] = await Promise.all([
          FetchDetailCommonInfo(contentId, contentTypeId),
          FetchIntroInfo(contentId, contentTypeId),
          FetchRepeatInfo(contentId, contentTypeId),
        ]);

        setCommon(commonData);
        setIntro(introData);
        
        if (Array.isArray(repeatDataResult)) {
          setRepeatInfo(repeatDataResult);
        } else if (repeatDataResult) {
          setRepeatInfo([repeatDataResult]);
        } else {
          setRepeatInfo([]);
        }

      } catch (error) {
        console.error("상세 정보 로딩 실패", error);
        setCommon(null);
        setIntro(null);
        setRepeatInfo([]);
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
      <TourDetail
        contentTypeId={Number(contentTypeId)}
        common={common}
        intro={intro}
        repeatInfo={repeatInfo}
      />
    </div>
  );
};

export default TourDetailPage;