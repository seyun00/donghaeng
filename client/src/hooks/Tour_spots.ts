import { useEffect, useState } from 'react';
import { fetchTourSpots, TouristSpot } from '../api/FetchTourApi';

export function useTouristSpots(areaCode: number, contentsType: number) {
  const [spots, setSpots] = useState<TouristSpot[]>([]);  // 관광지 데이터
  const [loading, setLoading] = useState(true);           // 로딩 상태
  const [error, setError] = useState<string | null>(null); // 에러 상태

  useEffect(() => {
    setLoading(true);
    setError(null);
    // areaCode, contentssType이 바뀔 때마다 API 호출
    fetchTourSpots(areaCode, contentsType)
      .then(setSpots)              // 데이터 저장
      .catch((err: any) => setError(err.message))
      .finally(() => setLoading(false));   // 로딩 종료
  }, [areaCode, contentsType]);

  return { spots, loading, error }; // 상태값 반환
}

export {};
      