// /src/components/PlanSpotItem.tsx

import React, { useEffect, useState } from 'react';
import { FetchDetailCommonInfo } from '../api/FetchTourApi';
import { Link } from 'react-router-dom';

export interface Spot {
  id: string;
  tour_api_content_id: string;
  content_type_id: string;
  plan_id: number;
  visit_day: number;
  visit_order: number;
}

interface PlanSpotItemProps {
  spot: Spot;
  isDragging: boolean;
  onSpotClick: (mapy: string, mapx: string, day: number) => void;
  onDeleteSpot: (spotId: string, spotTitle: string) => void; // [추가됨]
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
  spot, isDragging, onSpotClick, onDeleteSpot, handleDragStart, handleDragOver, handleDrop, handleDragEnd 
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
  
  const handleClick = () => {
    if (details?.mapy && details?.mapx) {
      onSpotClick(details.mapy, details.mapx, spot.visit_day);
    }
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // 부모의 onClick 이벤트(지도 이동)가 실행되지 않도록 함
    onDeleteSpot(spot.id, details?.title || '이 관광지');
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
      title="클릭하면 지도 이동, 드래그하여 순서 변경"
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', borderBottom: '1px solid #eee' }}>
        <img 
          src={details.firstimage || 'https://via.placeholder.com/80x60.png?text=No+Image'} 
          alt={details.title} 
          style={{ width: '80px', height: '60px', objectFit: 'cover', borderRadius: '4px' }}
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          <Link 
            to={`/detail/${spot.tour_api_content_id}/${spot.content_type_id}?planId=${spot.plan_id}`} 
            target="_blank"
            rel="noopener noreferrer"
            style={{ textDecoration: 'none', color: 'black', fontWeight: 'bold' }}
          >
            {details.title}
          </Link>
        </div>
        <button 
            onClick={handleDeleteClick}
            style={{ background: 'none', border: 'none', color: '#aaa', fontSize: '20px', cursor: 'pointer', padding: '0 5px' }}
            title="목록에서 삭제"
        >
            &times;
        </button>
      </div>
    </li>
  );
};

export default PlanSpotItem;