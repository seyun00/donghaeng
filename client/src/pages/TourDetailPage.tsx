// /src/pages/TourDetailPage.tsx

import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import TourDetail from '../tools/TourDetail';
import { FetchDetailCommonInfo, FetchIntroInfo, FetchRepeatInfo } from '../api/FetchTourApi';
import supabase from '../api/supabaseClient';

const TourDetailPage = () => {
    const { contentId, contentTypeId } = useParams<{ contentId: string; contentTypeId: string }>();
    const [searchParams] = useSearchParams();
    const planId = searchParams.get('planId');
    // [추가됨] URL에서 day 파라미터를 읽어옴
    const visitDay = searchParams.get('day');

    const [common, setCommon] = useState<any>(null);
    const [intro, setIntro] = useState<any>(null);
    const [repeatInfo, setRepeatInfo] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!contentId || !contentTypeId) return;
        const fetchData = async () => {
            setLoading(true);
            try {
                const [commonData, introData, repeatDataResult] = await Promise.all([
                    FetchDetailCommonInfo(contentId),
                    FetchIntroInfo(contentId, contentTypeId),
                    FetchRepeatInfo(contentId, contentTypeId),
                ]);
                setCommon(commonData);
                setIntro(introData);
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
        // [수정됨] planId 뿐만 아니라 visitDay도 있는지 확인
        if (!planId || !visitDay) {
            alert("추가할 여행 계획 또는 날짜가 지정되지 않았습니다.");
            return;
        }
        if (!common || !contentId || !contentTypeId) {
            alert("장소 정보를 불러오는 중입니다.");
            return;
        }

        const day = Number(visitDay);

        // 선택된 날짜(day)의 마지막 순서를 계산
        const { count, error: countError } = await supabase
            .from('plan_spots')
            .select('*', { count: 'exact', head: true })
            .eq('plan_id', Number(planId))
            .eq('visit_day', day);

        if (countError) {
            alert(`경로 추가 실패: ${countError.message}`);
            return;
        }

        const newSpot = {
            plan_id: Number(planId),
            tour_api_content_id: contentId,
            content_type_id: contentTypeId,
            visit_day: day, // URL에서 가져온 날짜로 설정
            visit_order: count ?? 0,
        };

        const { error } = await supabase.from('plan_spots').insert(newSpot);
        if (error) {
            if (error.code === '23505') {
                alert("이미 경로에 추가된 장소입니다.");
            } else {
                alert(`경로 추가 실패: ${error.message}`);
            }
        } else {
            alert(`'${common.title}'을(를) ${day}일차 경로에 추가했습니다.`);
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
                    {/* [수정됨] planId와 visitDay가 모두 있을 때만 버튼 표시 */}
                    {planId && visitDay && (
                        <button
                            onClick={handleAddToPlan}
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                        >
                            {visitDay}일차에 추가
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