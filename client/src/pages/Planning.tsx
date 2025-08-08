import { useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import ReactDOMServer from 'react-dom/server';
import supabase from '../api/supabaseClient';
import PlanSpotItem from '../components/PlanSpotItem';
import { FetchDetailCommonInfo } from '../api/FetchTourApi';
import NumberedMarker from '../components/Marker';

// 좌측 패널 컴포넌트
const VisitListPanel = ({ spots, planId }: { spots: any[], planId: string | undefined }) => {
  const handleSearchClick = () => {
    if (planId) {
      window.open(`/placeInformation?planId=${planId}`, '_blank', 'width=1024,height=768');
    } else {
      alert("여행 계획이 선택되지 않았습니다.");
    }
  };

  return (
    <div style={{ width: '350px', borderRight: '1px solid #ddd', padding: '15px', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
        <button style={{ flex: 1, padding: '8px', cursor: 'pointer' }}>방문지 리스트</button>
        <button onClick={handleSearchClick} style={{ flex: 1, padding: '8px', cursor: 'pointer' }}>방문지 검색</button>
      </div>
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <h3 style={{ marginTop: 0 }}>방문지 목록 ({spots.length}개)</h3>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {spots.map(spot => (
            <PlanSpotItem key={spot.id} spot={spot} />
          ))}
        </ul>
      </div>
    </div>
  );
};

// 메인 여행 계획 페이지
export default function Planning() {
  const { planId } = useParams<{ planId: string }>();
  const mapElement = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<any>(null);
  const [spots, setSpots] = useState<any[]>([]);
  const [planName, setPlanName] = useState('');
  const [loading, setLoading] = useState(true);
  const markersRef = useRef<any[]>([]);
  const polylineRef = useRef<any>(null);

  // DB에서 데이터 로드
  useEffect(() => {
    if (!planId) {
      setLoading(false);
      return;
    }
    const loadPlanData = async () => {
      setLoading(true);
      const [planResult, spotsResult] = await Promise.all([
        supabase.from('plans').select('plan_name').eq('id', planId).single(),
        supabase.from('plan_spots').select('*').eq('plan_id', planId).order('created_at')
      ]);
      
      const { data: planData } = planResult;
      if (planData) setPlanName(planData.plan_name);
      
      const { data: spotsData } = spotsResult;
      if (spotsData) {
        setSpots(spotsData);
      }
      setLoading(false);
    };
    loadPlanData();
    const channel = supabase.channel(`plan-spots-channel-${planId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'plan_spots', filter: `plan_id=eq.${planId}` },
        () => loadPlanData()
      ).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [planId]);

  // Naver 지도 초기화
  useEffect(() => {
    if (loading) return;
    const { naver } = window;
    if (!mapElement.current || !naver || mapInstance.current) return;
    
    mapInstance.current = new naver.maps.Map(mapElement.current, {
        center: new naver.maps.LatLng(37.5665, 126.9780),
        zoom: 12,
    });
  }, [loading]);

  // spots 목록이 변경될 때마다 지도에 마커 및 폴리라인 업데이트
  useEffect(() => {
    try {
        const { naver } = window;
        if (!mapInstance.current || !spots || !naver) {
            return;
        }
        
        const map = mapInstance.current;
        
        markersRef.current.forEach(marker => marker.setMap(null));
        if (polylineRef.current) {
            polylineRef.current.setMap(null);
        }
        
        if (spots.length === 0) {
            markersRef.current = [];
            return;
        }

        const bounds = new naver.maps.LatLngBounds();

        const fetchSpotDetailsAndCreateMarkers = async () => {
            const newMarkers: any[] = [];
            const polylinePath: any[] = [];

            for (let i = 0; i < spots.length; i++) {
                const spot = spots[i];
                const details = await FetchDetailCommonInfo(spot.tour_api_content_id, spot.content_type_id);
                
                if (details && details.mapy && details.mapx) {
                    const position = new naver.maps.LatLng(details.mapy, details.mapx);
                    polylinePath.push(position);

                    const marker = new naver.maps.Marker({
                        position: position,
                        map: map,
                        title: details.title,
                        icon: {
                            content: ReactDOMServer.renderToStaticMarkup(
                                <NumberedMarker number={i + 1} />
                            ),
                            anchor: new naver.maps.Point(15, 15),
                        }
                    });
                    newMarkers.push(marker);
                    bounds.extend(position);
                }
            }
            
            markersRef.current = newMarkers;

            if (polylinePath.length > 1) {
                const polyline = new naver.maps.Polyline({
                    map: map,
                    path: polylinePath,
                    strokeColor: '#5347AA',
                    strokeWeight: 3,
                    strokeOpacity: 0.8
                });
                polylineRef.current = polyline;
            }

            if (newMarkers.length > 0) {
                map.updateBy(bounds);
                if (map.getZoom() > 15) {
                    map.setZoom(15);
                }
            }
        };

        fetchSpotDetailsAndCreateMarkers();
    } catch (error) {
        console.error("마커 또는 폴리라인을 그리는 중 에러 발생:", error);
    }
  }, [spots]);

  if (loading) return <p>여행 계획을 불러오는 중...</p>;
  if (!planId) return <div><p>표시할 여행 계획이 없습니다.</p><Link to="/">홈으로</Link></div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <header style={{ padding: '15px', borderBottom: '1px solid #ddd', display: 'flex', justifyContent: 'space-between' }}>
        <h2>{planName || '여행 계획'}</h2>
        <div><button>친구 초대하기</button></div>
      </header>
      <div style={{ display: 'flex', flex: 1, height: 'calc(100vh - 65px)' }}>
        <VisitListPanel spots={spots} planId={planId} />
         <div 
          ref={mapElement} 
          style={{ 
            flex: 1, 
            width: '100%',
            height: '100%'
          }} 
        />
        <div style={{ width: '350px', borderLeft: '1px solid #ddd', padding: '15px' }}>채팅창 영역</div>
      </div>
    </div>
  );
}