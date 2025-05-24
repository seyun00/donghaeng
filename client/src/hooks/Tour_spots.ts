import { useEffect, useState } from 'react';
import { fetchTourSpots, TouristSpot } from '../api/fetch_tour_api';

export function useTouristSpots(areaCode: number) {
  const [spots, setSpots] = useState<TouristSpot[]>([]);  // 관광지 데이터
  const [loading, setLoading] = useState(true);           // 로딩 상태
  const [error, setError] = useState<string | null>(null); // 에러 상태

  useEffect(() => {
    setLoading(true);
    setError(null);
    // areaCode가 바뀔 때마다 API 호출
    fetchTourSpots(areaCode)
      .then(setSpots)              // 데이터 저장
      .catch(err => setError(err.message)) // 에러 처리
      .finally(() => setLoading(false));   // 로딩 종료
  }, [areaCode]);

  return { spots, loading, error }; // 상태값 반환
}

export {};