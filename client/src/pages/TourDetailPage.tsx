// /src/pages/TourDetailPage.tsx

import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import TourDetail from '../tools/TourDetail';
import { FetchDetailCommonInfo, FetchIntroInfo, FetchRepeatInfo } from '../api/FetchTourApi';
import supabase from '../api/supabaseClient';
import ReviewList, { Review } from '../components/ReviewList';
import ReviewForm from '../components/ReviewForm';
import useSession from '../hooks/useSesstion';

const TourDetailPage = () => {
    const { contentId, contentTypeId } = useParams<{ contentId: string; contentTypeId: string }>();
    const [searchParams] = useSearchParams();
    const planId = searchParams.get('planId');
    const visitDay = searchParams.get('day');
    const isLogin = useSession();

    const [common, setCommon] = useState<any>(null);
    const [intro, setIntro] = useState<any>(null);
    const [repeatInfo, setRepeatInfo] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [reviews, setReviews] = useState<Review[]>([]);

    const fetchReviews = async () => {
      if (!contentId) return;
      
      const { data, error } = await supabase
        .from('reviews')
        .select('*, public_profiles(nickname, profile_url)')
        .eq('content_id', contentId)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('리뷰 로딩 실패:', error);
      } else {
        const mappedData = data.map(review => ({
          ...review,
          userinfo: review.public_profiles
        }));
        setReviews(mappedData as Review[]);
      }
    };

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
        fetchReviews();
    }, [contentId, contentTypeId]);

    const handleReviewSubmit = async (rating: number, content: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert('로그인이 필요합니다.');
        return;
      }
      if (!contentId || !contentTypeId) return;
      
      const newReview = {
        user_id: user.id,
        content_id: contentId,
        content_type_id: contentTypeId,
        rating,
        content,
      };

      const { error } = await supabase.from('reviews').insert(newReview);
      if (error) {
        alert(`리뷰 등록 실패: ${error.message}`);
      } else {
        alert('리뷰가 성공적으로 등록되었습니다.');
        fetchReviews();
      }
    };

    const handleAddToPlan = async () => {
        if (!planId || !visitDay) {
            alert("추가할 여행 계획 또는 날짜가 지정되지 않았습니다.");
            return;
        }
        if (!common || !contentId || !contentTypeId) {
            alert("장소 정보를 불러오는 중입니다.");
            return;
        }

        const day = Number(visitDay);
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
            visit_day: day, 
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
                
                <div className="mt-8 p-6 bg-white rounded-xl shadow">
                    <h3 className="text-2xl font-bold mb-4">리뷰 ({reviews.length}개)</h3>
                    <ReviewList reviews={reviews} />
                    {isLogin && <ReviewForm onSubmit={handleReviewSubmit} />}
                </div>
            </div>
        </div>
    );
};

export default TourDetailPage;