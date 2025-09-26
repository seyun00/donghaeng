// /src/pages/TourDetailPage.tsx

import React, { useEffect, useState, useRef } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import TourDetail from '../tools/TourDetail';
import { FetchDetailCommonInfo, FetchIntroInfo, FetchRepeatInfo, FetchPopularInArea, FetchNearbySpots, TouristSpot } from '../api/FetchTourApi';
import supabase from '../api/supabaseClient';
import ReviewList, { Review } from '../components/ReviewList';
import ReviewForm from '../components/ReviewForm';
import useSession from '../hooks/useSesstion';
import NearbySpotsBanner from '../components/NearbySpotsBanner';

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
    const [popularSpots, setPopularSpots] = useState<TouristSpot[]>([]);
    const [nearbySpots, setNearbySpots] = useState<TouristSpot[]>([]);

    const mapElement = useRef<HTMLDivElement | null>(null);
    const mapInstance = useRef<any>(null);

    useEffect(() => {
        if (!contentId || !contentTypeId) return;
        
        // 데이터 로딩 및 지도 새 ㅇ성
        const fetchAllDataAndInitMap = async () => {
            setLoading(true);
            // 상태 초기화
            setCommon(null);
            setIntro(null);
            setRepeatInfo([]);
            setReviews([]);
            setPopularSpots([]);
            setNearbySpots([]);
            
            try {
                // 1. 관광지 상세 정보 및 리뷰 로딩
                const [commonData, introData, repeatDataResult, reviewDataResult] = await Promise.all([
                    FetchDetailCommonInfo(contentId),
                    FetchIntroInfo(contentId, contentTypeId),
                    FetchRepeatInfo(contentId, contentTypeId),
                    supabase.from('reviews').select('*, public_profiles(nickname, profile_url)').eq('content_id', contentId).order('created_at', { ascending: false })
                ]);
                
                setCommon(commonData);
                setIntro(introData);
                setRepeatInfo(Array.isArray(repeatDataResult) ? repeatDataResult : (repeatDataResult ? [repeatDataResult] : []));

                if (reviewDataResult.error) {
                    console.error('리뷰 로딩 실패:', reviewDataResult.error);
                } else {
                    const mappedData = reviewDataResult.data.map(review => ({ ...review, userinfo: review.public_profiles }));
                    setReviews(mappedData as Review[]);
                }

                // 2. 찜 상태 확인
                if (isLogin) {
                    checkFavoriteStatus();
                }

                // 3. 추천 관광지 정보 로딩
                if (commonData) {
                    const popularPromise = commonData.areacode && commonData.sigungucode 
                        ? FetchPopularInArea(commonData.areacode, commonData.sigungucode, contentTypeId)
                        : Promise.resolve([]);
                    
                    const nearbyPromise = commonData.mapy && commonData.mapx
                        ? FetchNearbySpots(commonData.mapx, commonData.mapy, contentTypeId)
                        : Promise.resolve([]);

                    const [popular, nearby] = await Promise.all([popularPromise, nearbyPromise]);
                    setPopularSpots(popular);
                    setNearbySpots(nearby);
                }

                // 4. 모든 데이터가 준비된 후 지도 생성 및 마커 표시
                if (commonData?.mapy && commonData?.mapx) {
                    const { naver } = window;
                    if (mapElement.current && naver) {
                        const location = new naver.maps.LatLng(commonData.mapy, commonData.mapx);
                        const mapOptions = {
                            center: location,
                            zoom: 17,
                            zoomControl: true,
                        };
                        mapInstance.current = new naver.maps.Map(mapElement.current, mapOptions);
                        new naver.maps.Marker({
                            position: location,
                            map: mapInstance.current,
                        });
                    }
                }

            } catch (error) {
                console.error("페이지 전체 데이터 로딩 실패", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAllDataAndInitMap();
    }, [contentId, contentTypeId, isLogin]);


    const checkFavoriteStatus = async () => {
        if (!isLogin || !contentId) return;
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data, error } = await supabase.from('favorites').select('id').eq('user_id', user.id).eq('content_id', contentId).maybeSingle();
        if (error) console.error('찜 상태 확인 실패:', error);
        else setIsFavorited(!!data);
    };

    const handleReviewSubmit = async (rating: number, content: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !contentId || !contentTypeId) return;
      const { error } = await supabase.from('reviews').insert({ user_id: user.id, content_id: contentId, content_type_id: contentTypeId, rating, content });
      if (error) alert(`리뷰 등록 실패: ${error.message}`);
      else {
        alert('리뷰가 성공적으로 등록되었습니다.');
        // 리뷰 목록 새로고침
        const { data, error: newError } = await supabase.from('reviews').select('*, public_profiles(nickname, profile_url)').eq('content_id', contentId).order('created_at', { ascending: false });
        if (!newError) {
          const mappedData = data.map(r => ({...r, userinfo: r.public_profiles}));
          setReviews(mappedData as Review[]);
        }
      }
    };

    const handleAddToPlan = async () => {
        if (!planId || !visitDay || !common || !contentId || !contentTypeId) return;
        const day = Number(visitDay);
        const { count } = await supabase.from('plan_spots').select('*', { count: 'exact', head: true }).eq('plan_id', Number(planId)).eq('visit_day', day);
        const { error } = await supabase.from('plan_spots').insert({ plan_id: Number(planId), tour_api_content_id: contentId, content_type_id: contentTypeId, visit_day: day, visit_order: count ?? 0 });
        if (error) {
            alert(error.code === '23505' ? "이미 경로에 추가된 장소입니다." : `경로 추가 실패: ${error.message}`);
        } else {
            alert(`'${common.title}'을(를) ${day}일차 경로에 추가했습니다.`);
            window.close();
        }
    };

    const handleToggleFavorite = async () => {
        if (!isLogin || !contentId || !contentTypeId || !common) return;
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        if (isFavorited) {
            const { error } = await supabase.from('favorites').delete().eq('user_id', user.id).eq('content_id', contentId);
            if (error) alert(`찜 취소 실패: ${error.message}`);
            else {
                alert('찜 목록에서 삭제되었습니다.');
                setIsFavorited(false);
            }
        } else {
            const { error } = await supabase.from('favorites').insert({ user_id: user.id, content_id: contentId, content_type_id: contentTypeId, title: common.title, first_image: common.firstimage || null });
            if (error) alert(`찜하기 실패: ${error.message}`);
            else {
                alert('찜 목록에 추가되었습니다.');
                setIsFavorited(true);
            }
        }
    };

    if (loading) return <p className="text-center p-10">로딩 중...</p>;
    if (!common) return <p className="text-center p-10 text-red-500">데이터를 불러올 수 없습니다.</p>;

    return (
        <div className="p-4 bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <div className="flex justify-between items-center mb-4">
                        <h1 className="text-2xl font-bold">관광지 상세 정보</h1>
                        {planId && visitDay && (
                            <button onClick={handleAddToPlan} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
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
                    <div className="mt-8">
                        <h3 className="text-xl font-semibold mb-2">위치 정보</h3>
                        <div ref={mapElement} style={{ width: '100%', height: '400px', borderRadius: '8px' }} />
                    </div>
                    {isLogin && (
                        <div className="mt-8 mb-8 p-4 bg-white rounded-xl shadow flex items-center justify-center space-x-2">
                            <button onClick={handleToggleFavorite} className="flex items-center space-x-2 text-lg font-semibold text-gray-700 hover:text-red-500 transition-colors">
                                <span>{isFavorited ? '내 찜 리스트에서 삭제' : '내 찜리스트에 추가하기'}</span>
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
                <div className="lg:col-span-1 lg:sticky lg:top-8 self-start">
                    {!loading && (popularSpots.length > 0 || nearbySpots.length > 0) && (
                        <NearbySpotsBanner 
                            popularSpots={popularSpots}
                            nearbySpots={nearbySpots}
                            currentSpotId={contentId!} 
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default TourDetailPage;