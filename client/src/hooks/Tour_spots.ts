// hooks/Tour_spots.ts

import { useEffect, useState } from 'react';
import { FetchTourSpots, TouristSpot, FetchEvents } from '../api/FetchTourApi';

// 날짜를 YYYYMMDD 형식으로 변환하는 함수
const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}${month}${day}`;
};

// eventDate 파라미터 추가
export function useTouristSpots(
  areaCode: number,
  contentsType: number,
  sigunguCode?: number,
  eventDate?: Date
) {
  const [spots, setSpots] = useState<TouristSpot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 행사(15) 타입인데 날짜가 없으면 API 호출 중단
    if (contentsType === 15 && !eventDate) {
      setSpots([]);
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError(null);

    let fetcher: Promise<TouristSpot[]>;

    // 콘텐츠 타입에 따라 다른 API 함수 호출
    if (contentsType === 15 && eventDate) {
      const dateString = formatDate(eventDate);
      fetcher = FetchEvents(dateString, areaCode, sigunguCode);
    } else {
      fetcher = FetchTourSpots(areaCode, contentsType, sigunguCode);
    }

    fetcher
      .then(setSpots)
      .catch((err: any) => setError(err.message))
      .finally(() => setLoading(false));

  }, [areaCode, contentsType, sigunguCode, eventDate]); // 의존성 배열에 eventDate 추가

  return { spots, loading, error };
}

