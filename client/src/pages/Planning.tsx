// /src/pages/Planning.tsx

import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import ReactDOMServer from 'react-dom/server';
import supabase from '../api/supabaseClient';
import PlanSpotItem, { Spot } from '../components/PlanSpotItem';
import { FetchDetailCommonInfo } from '../api/FetchTourApi';
import NumberedMarker from '../components/Marker';
import { useDragAndDrop } from '../hooks/useDragAndDrop';

export interface EnrichedSpot extends Spot {
  mapx?: string;
  mapy?: string;
}

const VisitListPanel = ({
  spotsByDay,
  planId,
  planDuration,
  draggedItemId,
  onSpotClick,
  onDayViewChange,
  onDeleteSpot,
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
  onDeleteSpot: (spotId: string, spotTitle: string) => void;
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
                  onDeleteSpot={onDeleteSpot}
                  handleDragStart={handleDragStart}
                  handleDragOver={handleDragOver}
                  handleDrop={handleDrop}
                  handleDragEnd={handleDragEnd}
                />
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- 메인 여행 계획 페이지 ---
export default function Planning() {
  const { planId } = useParams<{ planId: string }>();
  const mapElement = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<any>(null);
  const [spots, setSpots] = useState<EnrichedSpot[]>([]);
  const [plan, setPlan] = useState<{ plan_name: string; start_date: string; end_date: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const markersRef = useRef<any[]>([]);
  const polylineRef = useRef<any>(null);

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
    
    // [수정됨] 관광지 실시간 구독 로직 개선
    const channel = supabase.channel(`plan-spots-channel-${planId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'plan_spots', filter: `plan_id=eq.${planId}` },
        async (payload) => {
          console.log('새로운 장소 추가 감지:', payload.new);
          const newSpot = payload.new as Spot;
          const details = await FetchDetailCommonInfo(newSpot.tour_api_content_id);
          const newEnrichedSpot = { ...newSpot, mapx: details?.mapx, mapy: details?.mapy };
          
          setSpots(currentSpots => [...currentSpots, newEnrichedSpot]
            .sort((a, b) => a.visit_day - b.visit_day || a.visit_order - b.visit_order)
          );
        }
      )
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'plan_spots', filter: `plan_id=eq.${planId}` },
        (payload) => {
          console.log('장소 순서 변경 감지:', payload.new);
          setSpots(currentSpots => currentSpots
            .map(spot => spot.id === payload.new.id ? { ...spot, ...payload.new } : spot)
            .sort((a, b) => a.visit_day - b.visit_day || a.visit_order - b.visit_order)
          );
        }
      )
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'plan_spots', filter: `plan_id=eq.${planId}` },
        (payload) => {
          console.log('장소 삭제 감지:', payload.old.id);
          setSpots(currentSpots => currentSpots.filter(spot => spot.id !== payload.old.id));
        }
      )
      .subscribe();

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
    if (!mapInstance.current || !spots || !naver) return;

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
          position, map, title: `Spot ${index + 1}`,
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

  const handleSpotClick = (mapy: string, mapx: string, day: number) => {
    setSelectedDay(day);
    if (mapInstance.current && mapy && mapx) {
      const position = new window.naver.maps.LatLng(Number(mapy), Number(mapx));
      mapInstance.current.panTo(position);
    }
  };

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
        // 실시간 구독이 UI를 업데이트하므로 여기서는 상태를 직접 변경하지 않습니다.
    }
  };

  if (loading) return <p>여행 계획을 불러오는 중...</p>;
  if (error) return <div><p>{error}</p><Link to="/">홈으로</Link></div>;
  if (!planId || !plan) return <div><p>표시할 여행 계획이 없습니다.</p><Link to="/">홈으로</Link></div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <header style={{ padding: '15px', borderBottom: '1px solid #ddd', display: 'flex', justifyContent: 'space-between' }}>
        <h2>{plan.plan_name || '여행 계획'}</h2>
        <div><button>친구 초대하기</button></div>
      </header>
      <div style={{ display: 'flex', flex: 1, height: 'calc(100vh - 65px)' }}>
        <VisitListPanel
          spotsByDay={spotsByDay}
          planId={planId}
          planDuration={planDuration}
          draggedItemId={draggedItemId}
          onSpotClick={handleSpotClick}
          onDayViewChange={setSelectedDay}
          onDeleteSpot={handleDeleteSpot}
          handleDragStart={handleDragStart}
          handleDragOver={handleDragOver}
          handleDrop={handleDrop}
          handleDragEnd={handleDragEnd}
        />
        <div 
          ref={mapElement} 
          style={{ flex: 1, width: '100%', height: '100%' }} 
        />
        <div style={{ width: '350px', borderLeft: '1px solid #ddd', padding: '15px' }}>
          채팅창 영역
        </div>
      </div>
    </div>
  );
}