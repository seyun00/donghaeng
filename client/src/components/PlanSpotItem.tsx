// /src/components/PlanSpotItem.tsx

import React, { useEffect, useState } from 'react';
import { FetchDetailCommonInfo } from '../api/FetchTourApi';
import { Link } from 'react-router-dom';

// 타입을 export하여 외부에서 사용할 수 있도록 함
export interface Spot {
  id: string;
  tour_api_content_id: string;
  content_type_id: string;
  plan_id: number;
  visit_day: number;
  visit_order: number;
}

// props 정의
interface PlanSpotItemProps {
  spot: Spot;
  isDragging: boolean;
  // [수정됨] onSpotClick prop에 day: number 추가
  onSpotClick: (mapy: string, mapx: string, day: number) => void;
  handleDragStart: (spotId: string) => void;
  handleDragOver: (e: React.DragEvent<HTMLLIElement>, spotId: string) => void;
  handleDrop: (spotId: string) => void;
  handleDragEnd: () => void;
}

interface SpotDetails {
  title: string;
  firstimage: string;
  mapx?: string;
  mapy?: string;
}

const PlanSpotItem: React.FC<PlanSpotItemProps> = ({ 
  spot, isDragging, onSpotClick, handleDragStart, handleDragOver, handleDrop, handleDragEnd 
}) => {
  const [details, setDetails] = useState<SpotDetails | null>(null);
  const [loading, setLoading] = useState(true);

  const style: React.CSSProperties = {
    opacity: isDragging ? 0.5 : 1,
    cursor: 'pointer',
  };

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      try {
        const data = await FetchDetailCommonInfo(spot.tour_api_content_id);
        if (data) {
          setDetails(data);
        }
      } catch (error) {
        console.error("장소 상세 정보 로딩 실패:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [spot.tour_api_content_id]);
  
  // [수정됨] 클릭 시 좌표와 함께 '일차' 정보도 부모에게 전달
  const handleClick = () => {
    if (details?.mapy && details?.mapx) {
      onSpotClick(details.mapy, details.mapx, spot.visit_day);
    }
  };


  if (loading) {
    return <li style={{ padding: '10px', borderBottom: '1px solid #eee' }}>정보를 불러오는 중...</li>;
  }
  if (!details) {
    return <li style={{ padding: '10px', borderBottom: '1px solid #eee' }}>정보를 불러올 수 없습니다.</li>;
  }

  return (
    <li
      draggable="true"
      onDragStart={() => handleDragStart(spot.id)}
      onDragOver={(e) => handleDragOver(e, spot.id)}
      onDrop={() => handleDrop(spot.id)}
      onDragEnd={handleDragEnd}
      onClick={handleClick}
      style={style}
      title="클릭하면 지도를 이동합니다. 드래그하여 순서를 바꾸세요."
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', borderBottom: '1px solid #eee' }}>
        <img 
          src={details.firstimage || 'https://via.placeholder.com/80x60.png?text=No+Image'} 
          alt={details.title} 
          style={{ width: '80px', height: '60px', objectFit: 'cover', borderRadius: '4px' }}
        />
        <div style={{ flex: 1 }}>
          <Link 
            to={`/detail/${spot.tour_api_content_id}/${spot.content_type_id}?planId=${spot.plan_id}`} 
            target="_blank"
            rel="noopener noreferrer"
            style={{ textDecoration: 'none', color: 'black', fontWeight: 'bold' }}
          >
            {details.title}
          </Link>
        </div>
      </div>
    </li>
  );
};

export default PlanSpotItem;