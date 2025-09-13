// /src/pages/Planning.tsx

import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import ReactDOMServer from 'react-dom/server';
import supabase from '../api/supabaseClient';
import PlanSpotItem, { Spot } from '../components/PlanSpotItem';
import { FetchDetailCommonInfo } from '../api/FetchTourApi';
import NumberedMarker from '../components/Marker';
import { useDragAndDrop } from '../hooks/useDragAndDrop';
import Chatting from '../components/Chatting';
import AddFriendsToPlanning from '../components/AddFriendToPlanning';
import PlanMembersList from '../components/PlanMembersList';
import BudgetList from '../components/BudgetList';

export interface EnrichedSpot extends Spot {
  mapx?: string;
  mapy?: string;
}

type UserInfo = {
  user_id: string;
  nickname: string;
  profile_url?: string;
};

// --- 좌측 패널 컴포넌트 ---
const VisitListPanel = ({
  spotsByDay,
  planId,
  planDuration,
  draggedItemId,
  onSpotClick,
  onDayViewChange,
  onDeleteSpot, // [추가됨]
  handleDragStart,
  handleDragOver,
  handleDrop,
  handleDragEnd,
}: {
  spotsByDay: Record<number, EnrichedSpot[]>;
  planId: string | undefined;
  planDuration: number;
  draggedItemId: string | null;
  onSpotClick: (mapy: string, mapx: string, day: number) => void;
  onDayViewChange: (day: number) => void;
  onDeleteSpot: (spotId: string, spotTitle: string) => void; // [추가됨]
  handleDragStart: (spotId: string) => void;
  handleDragOver: (e: React.DragEvent<HTMLLIElement>, spotId: string) => void;
  handleDrop: (spotId: string) => void;
  handleDragEnd: () => void;
}) => {
  const handleAddSpotClick = (day: number) => {
    if (planId) {
      window.open(`/placeInformation?planId=${planId}&day=${day}`, '_blank', 'width=1024,height=768');
    } else {
      alert("여행 계획이 선택되지 않았습니다.");
    }
  };

  const [totalBudget, setTotalBudget] = useState(0);
  
  const fetchTotalBudget = async () => {
    if (!planId) return;
    const { data, error } = await supabase
      .from('budgets')
      .select('cost')
      .eq('plan_id', planId);
    if (data) {
      const sum = data.reduce((acc, curr) => acc + (curr.cost || 0), 0);
      setTotalBudget(sum);
    }
  };
  
  useEffect(() => {
    fetchTotalBudget();
  }, [planId]);

  const handleBudgetAdded = () => {
    fetchTotalBudget();
  };

  return (
    <div style={{ width: '350px', borderRight: '1px solid #ddd', padding: '15px', display: 'flex', flexDirection: 'column' }}>
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {Array.from({ length: planDuration }, (_, i) => i + 1).map(day => (
          <div key={day} style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', paddingBottom: '5px' }}>
              <h3 
                style={{ marginTop: 0, cursor: 'pointer', flexGrow: 1 }}
                onClick={() => onDayViewChange(day)}
                title={`${day}일차 전체 보기`}
              >
                {day}일차 ({spotsByDay[day]?.length || 0}개)
              </h3>
              <button 
                onClick={() => handleAddSpotClick(day)}
                style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', padding: '0 10px' }}
                title={`${day}일차에 방문지 추가`}
              >
                +
              </button>
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {spotsByDay[day] && spotsByDay[day].map(spot => (
                <PlanSpotItem
                  key={spot.id}
                  spot={spot}
                  isDragging={draggedItemId === spot.id}
                  onSpotClick={onSpotClick}
                  onDeleteSpot={onDeleteSpot} // [추가됨]
                  handleDragStart={handleDragStart}
                  handleDragOver={handleDragOver}
                  handleDrop={handleDrop}
                  handleDragEnd={handleDragEnd}
                />
              ))}
            </ul>
            <div>
              <BudgetList date={day} planId={planId} onBudgetAdded={handleBudgetAdded} />
            </div>
          </div>
        ))}
        <div className='bg-gray-200 rounded-[5px] px-2 pb-1 shadow-[1px_1px_5px_1px_rgba(0,0,0,0.2)] mx-1 mb-2'>
          <p className='py-2 text-sm text-center'>총 예산</p>
          <p className='text-center'>{totalBudget.toLocaleString()} 원</p>
        </div>
      </div>
    </div>
  );
};

// --- 메인 여행 계획 페이지 ---
export default function Planning() {
  const { planId } = useParams<{ planId: string }>();
  const [currentUser, setCurrentUser] = useState<UserInfo | null>(null);
  const mapElement = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<any>(null);
  const [spots, setSpots] = useState<EnrichedSpot[]>([]);
  const [plan, setPlan] = useState<{ plan_name: string; start_date: string; end_date: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const markersRef = useRef<any[]>([]);
  const polylineRef = useRef<any>(null);
  const [membersOpen, setMembersOpen] = useState(false);
  const [addFriendOpen, setAddFriendOpen] = useState(false);

  const { draggedItemId, handleDragStart, handleDragOver, handleDrop, handleDragEnd } = useDragAndDrop(spots, setSpots);

  const planDuration = useMemo(() => {
    if (!plan?.start_date || !plan?.end_date) return 1;
    const start = new Date(plan.start_date);
    const end = new Date(plan.end_date);
    const diff = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
    return Math.max(1, diff + 1);
  }, [plan]);

  useEffect(() => {
    setSelectedDay(1);
    if (!planId) {
      setLoading(false);
      return;
    }

    const loadPlanData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [planResult, spotsResult] = await Promise.all([
          supabase.from('plans').select('plan_name, start_date, end_date').eq('id', planId).single(),
          supabase.from('plan_spots').select('*').eq('plan_id', planId).order('visit_day').order('visit_order')
        ]);
        
        const { data: planData, error: planError } = planResult;
        if (planError) throw planError;
        if (planData) setPlan(planData);

        const { data: spotsData, error: spotsError } = spotsResult;
        if (spotsError) throw spotsError;
        
        if (spotsData) {
          const enrichedSpots = await Promise.all(
            (spotsData as Spot[]).map(async (spot) => {
              const details = await FetchDetailCommonInfo(spot.tour_api_content_id);
              return { ...spot, mapx: details?.mapx, mapy: details?.mapy };
            })
          );
          setSpots(enrichedSpots);
        } else {
          setSpots([]);
        }

      } catch (err: any) {
        console.error("여행 계획 로딩 실패:", err);
        setError("여행 계획을 불러오는 데 실패했습니다.");
        setPlan(null);
        setSpots([]);
      } finally {
        setLoading(false);
      }
    };
    loadPlanData();

    const channel = supabase.channel(`plan-spots-channel-${planId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'plan_spots', filter: `plan_id=eq.${planId}` },
        () => loadPlanData()
      ).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [planId]);

  useEffect(() => {
    if (loading) return;
    const { naver } = window;
    if (!mapElement.current || !naver) return;
    if (!mapInstance.current) {
        mapInstance.current = new naver.maps.Map(mapElement.current, {
            center: new naver.maps.LatLng(37.5665, 126.9780),
            zoom: 12,
        });
    }
  }, [loading]);

  useEffect(() => {
    if (loading) return;
    const { naver } = window;
    if (!mapElement.current || !spots || !naver) return;

    const map = mapInstance.current;
    
    const clearMap = () => {
      markersRef.current.forEach(marker => marker.setMap(null));
      markersRef.current = [];
      if (polylineRef.current) {
        polylineRef.current.setMap(null);
        polylineRef.current = null;
      }
    };
    
    clearMap();

    const spotsForSelectedDay = spots.filter(spot => spot.visit_day === selectedDay);
    if (spotsForSelectedDay.length === 0) return;

    const bounds = new naver.maps.LatLngBounds();
    const newMarkers: any[] = [];
    const polylinePath: any[] = [];
    
    spotsForSelectedDay.forEach((spot, index) => {
      if (spot.mapy && spot.mapx) {
        const position = new naver.maps.LatLng(spot.mapy, spot.mapx);
        polylinePath.push(position);
        const marker = new naver.maps.Marker({
          position,
          map,
          title: `Spot ${index + 1}`,
          icon: {
            content: ReactDOMServer.renderToStaticMarkup(<NumberedMarker number={index + 1} />),
            anchor: new naver.maps.Point(15, 15),
          }
        });
        newMarkers.push(marker);
        bounds.extend(position);
      }
    });
      
    markersRef.current = newMarkers;

    if (polylinePath.length > 1) {
      polylineRef.current = new naver.maps.Polyline({
        map: map, path: polylinePath, strokeColor: '#5347AA',
        strokeWeight: 3, strokeOpacity: 0.8
      });
    }
    
    if (newMarkers.length > 0) {
      map.panToBounds(bounds);
    }

  }, [spots, loading, selectedDay]);

  const spotsByDay = useMemo(() => {
    return spots.reduce((acc, spot) => {
      const day = spot.visit_day;
      if (!acc[day]) acc[day] = [];
      acc[day].push(spot);
      return acc;
    }, {} as Record<number, EnrichedSpot[]>);
  }, [spots]);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUser({
          user_id: user.id,
          nickname: user.user_metadata?.nickname || '익명',
          profile_url: user.user_metadata?.avatar_url,
        });
      }
    };
    fetchUser();
  }, []);

  const handleSpotClick = (mapy: string, mapx: string, day: number) => {
    setSelectedDay(day);

    if (mapInstance.current && mapy && mapx) {
      const position = new window.naver.maps.LatLng(Number(mapy), Number(mapx));
      mapInstance.current.panTo(position);
    }
  };

  // [추가됨] 방문지 삭제 핸들러 함수
  const handleDeleteSpot = async (spotId: string, spotTitle: string) => {
    if (!window.confirm(`'${spotTitle}'을(를) 정말 삭제하시겠습니까?`)) {
        return;
    }

    const { error } = await supabase
        .from('plan_spots')
        .delete()
        .eq('id', spotId);

    if (error) {
        alert(`삭제에 실패했습니다: ${error.message}`);
    } else {
        alert('방문지가 삭제되었습니다.');
        setSpots(prevSpots => prevSpots.filter(spot => spot.id !== spotId));
    }
  };
  
  if (loading) return <p>여행 계획을 불러오는 중...</p>;
  if (error) return <div><p>{error}</p><Link to="/">홈으로</Link></div>;
  if (!planId || !plan) return <div><p>표시할 여행 계획이 없습니다.</p><Link to="/">홈으로</Link></div>;
  if (!currentUser) return <p>사용자 정보를 불러오는 중...</p>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <header style={{ padding: '15px', borderBottom: '1px solid #ddd', display: 'flex', justifyContent: 'space-between' }}>
        <div>
          <span><Link to="/" >동행</Link></span>
          <span className='ml-8'>{plan.plan_name || '여행 계획'}</span>
        </div>
        <div>
          <button className="mr-8" onClick={() => setMembersOpen(true)}>멤버 목록</button>
          <button onClick={() => setAddFriendOpen(true)}>친구 초대하기</button>
        </div>
        <PlanMembersList
          open={membersOpen}
          onClose={() => setMembersOpen(false)}
          planId={planId!}
        />
        <AddFriendsToPlanning
            open={addFriendOpen}
            onClose={() => setAddFriendOpen(false)}
            currentUserId={currentUser.user_id}
            planId={planId}
          />
      </header>
      <div style={{ display: 'flex', flex: 1, height: 'calc(100vh - 65px)' }}>
        <VisitListPanel
          spotsByDay={spotsByDay}
          planId={planId}
          planDuration={planDuration}
          draggedItemId={draggedItemId}
          onSpotClick={handleSpotClick}
          onDayViewChange={setSelectedDay}
          onDeleteSpot={handleDeleteSpot} // [추가됨]
          handleDragStart={handleDragStart}
          handleDragOver={handleDragOver}
          handleDrop={handleDrop}
          handleDragEnd={handleDragEnd}
        />
        <div 
          ref={mapElement} 
          style={{ flex: 1, width: '100%', height: '100%' }} 
        />
        <div style={{ width: '350px', borderLeft: '1px solid #ddd', padding: '0px' }}>
          <Chatting planId={planId!} user={currentUser} />
        </div>
      </div>
    </div>
  );
}