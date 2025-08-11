// /src/pages/TourDetailPage.tsx

import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import TourDetail from '../tools/TourDetail';
import { FetchDetailCommonInfo, FetchIntroInfo, FetchRepeatInfo } from '../api/FetchTourApi';
import supabase from '../api/supabaseClient';

const TourDetailPage = () => {
  const { contentId, contentTypeId } = useParams<{ contentId: string; contentTypeId: string }>();
  const [searchParams] = useSearchParams();
  const planId = searchParams.get('planId');

  const [common, setCommon] = useState<any>(null);
  const [intro, setIntro] = useState<any>(null);
  const [repeatInfo, setRepeatInfo] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!contentId || !contentTypeId) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        // [수정됨] FetchDetailCommonInfo 호출 시 contentTypeId 제거
        const [commonData, introData, repeatDataResult] = await Promise.all([
          FetchDetailCommonInfo(contentId),
          FetchIntroInfo(contentId, contentTypeId),
          FetchRepeatInfo(contentId, contentTypeId),
        ]);

        setCommon(commonData);
        setIntro(introData);
        // API가 단일 객체를 반환할 수도 있으므로 항상 배열로 처리
        setRepeatInfo(Array.isArray(repeatDataResult) ? repeatDataResult : (repeatDataResult ? [repeatDataResult] : []));
        
      } catch (error) {
        console.error("상세 정보 로딩 실패", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [contentId, contentTypeId]);

  const handleAddToPlan = async () => {
    if (!planId) {
      alert("추가할 여행 계획이 지정되지 않았습니다.");
      return;
    }
    if (!common || !contentId || !contentTypeId) {
      alert("장소 정보를 불러오는 중입니다.");
      return;
    }

    // plan_spots 테이블의 spot_order 값을 위해 현재 목록 개수를 가져옴
    const { count, error: countError } = await supabase
      .from('plan_spots')
      .select('*', { count: 'exact', head: true })
      .eq('plan_id', Number(planId));

    if (countError) {
      alert(`경로 추가 실패: ${countError.message}`);
      return;
    }

    const newSpot = {
      plan_id: Number(planId),
      tour_api_content_id: contentId,
      content_type_id: contentTypeId,
      spot_order: count ?? 0, // 다음 순서 번호 부여
    };

    const { error } = await supabase.from('plan_spots').insert(newSpot);

    if (error) {
      if (error.code === '23505') {
        alert("이미 경로에 추가된 장소입니다.");
      } else {
        alert(`경로 추가 실패: ${error.message}`);
      }
    } else {
      alert(`'${common.title}'을(를) 경로에 추가했습니다.`);
      window.close();
    }
  };

  if (loading) return <p className="text-center p-10">로딩 중...</p>;
  if (!common) return <p className="text-center p-10 text-red-500">데이터를 불러올 수 없습니다.</p>;

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">관광지 상세 정보</h1>
          {planId && (
            <button
              onClick={handleAddToPlan}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              이 경로에 추가
            </button>
          )}
        </div>
        <TourDetail
          contentTypeId={Number(contentTypeId)}
          common={common}
          intro={intro}
          repeatInfo={repeatInfo}
        />
      </div>
    </div>
  );
};

export default TourDetailPage;