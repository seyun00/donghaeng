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
    const [isFavorited, setIsFavorited] = useState(false);

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

    const checkFavoriteStatus = async () => {
        if (!isLogin || !contentId) return;
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
            .from('favorites')
            .select('id')
            .eq('user_id', user.id)
            .eq('content_id', contentId)
            .maybeSingle();

        if (error) {
            console.error('찜 상태 확인 실패:', error);
        } else {
            setIsFavorited(!!data);
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
        if (isLogin) {
          checkFavoriteStatus();
        }
    }, [contentId, contentTypeId, isLogin]);

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

    const handleToggleFavorite = async () => {
        if (!isLogin) {
            alert('로그인이 필요합니다.');
            return;
        }
        const { data: { user } } = await supabase.auth.getUser();
        if (!user || !contentId || !contentTypeId || !common) return;

        if (isFavorited) {
            const { error } = await supabase
                .from('favorites')
                .delete()
                .eq('user_id', user.id)
                .eq('content_id', contentId);
            if (error) {
                alert(`찜 취소 실패: ${error.message}`);
            } else {
                alert('찜 목록에서 삭제되었습니다.');
                setIsFavorited(false);
            }
        } else {
            const newFavorite = {
                user_id: user.id,
                content_id: contentId,
                content_type_id: contentTypeId,
                title: common.title,
                first_image: common.firstimage || null,
            };
            const { error } = await supabase.from('favorites').insert(newFavorite);
            if (error) {
                alert(`찜하기 실패: ${error.message}`);
            } else {
                alert('찜 목록에 추가되었습니다.');
                setIsFavorited(true);
            }
        }
    };

    if (loading) return <p className="text-center p-10">로딩 중...</p>;
    if (!common) return <p className="text-center p-10 text-red-500">데이터를 불러올 수 없습니다.</p>;

    return (
        <div className="p-4 bg-gray-50 min-h-screen">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-4">
                    {/* [수정됨] 관광지 이름 대신 고정된 페이지 제목을 표시 */}
                    <h1 className="text-2xl font-bold">관광지 상세 정보</h1>
                    <div className="flex items-center gap-2">
                        {planId && visitDay && (
                            <button
                                onClick={handleAddToPlan}
                                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                            >
                                {visitDay}일차에 추가
                            </button>
                        )}
                    </div>
                </div>
                <TourDetail
                    contentTypeId={Number(contentTypeId)}
                    common={common}
                    intro={intro}
                    repeatInfo={repeatInfo}
                />
                
                {isLogin && (
                    <div className="mt-8 mb-8 p-4 bg-white rounded-xl shadow flex items-center justify-center space-x-2">
                        <button 
                            onClick={handleToggleFavorite}
                            className="flex items-center space-x-2 text-lg font-semibold text-gray-700 hover:text-red-500 transition-colors"
                        >
                            <span>
                                {isFavorited ? '내 찜 리스트에서 삭제' : '내 찜리스트에 추가하기'}
                            </span>
                            <svg xmlns="http://www.w3.org/2000/svg" className={`h-7 w-7 transition-colors ${isFavorited ? 'text-red-500 fill-current' : 'text-gray-400'}`} viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </div>
                )}

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