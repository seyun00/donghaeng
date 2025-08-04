import React, { useEffect, useState } from 'react';
import { FetchDetailCommonInfo } from '../api/FetchTourApi';
import { Link } from 'react-router-dom';

interface PlanSpotItemProps {
  spot: {
    tour_api_content_id: string;
    content_type_id: string;
    plan_id: number;
  };
}

const PlanSpotItem: React.FC<PlanSpotItemProps> = ({ spot }) => {
  const [details, setDetails] = useState<{ title: string; firstimage: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      try {
        const data = await FetchDetailCommonInfo(spot.tour_api_content_id, spot.content_type_id);
        if (data) {
          setDetails({ title: data.title, firstimage: data.firstimage });
        }
      } catch (error) {
        console.error("장소 상세 정보 로딩 실패:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [spot.tour_api_content_id, spot.content_type_id]);

  if (loading) {
    return <li style={{ padding: '10px', borderBottom: '1px solid #eee' }}>정보를 불러오는 중...</li>;
  }

  if (!details) {
    return <li style={{ padding: '10px', borderBottom: '1px solid #eee' }}>정보를 불러올 수 없습니다.</li>;
  }

  return (
    <li style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', borderBottom: '1px solid #eee' }}>
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
    </li>
  );
};

export default PlanSpotItem;
