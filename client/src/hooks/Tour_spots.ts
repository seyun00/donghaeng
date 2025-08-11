import { useEffect, useState } from 'react';
import { FetchTourSpots, TouristSpot, FetchEvents } from '../api/FetchTourApi';

const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}${month}${day}`;
};

export function useTouristSpots(
  contentsType: number,
  lDongRegnCd?: number,
  lDongSignguCd?: number,
  eventDate?: Date,
  eventEndDate?: Date | null 
) {
  const [spots, setSpots] = useState<TouristSpot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (contentsType === 15 && !eventDate) {
      setSpots([]);
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError(null);

    let fetcher: Promise<TouristSpot[]>;

    if (contentsType === 15 && eventDate) {
      const startDateString = formatDate(eventDate);
      const endDateString = eventEndDate ? formatDate(eventEndDate) : undefined;
      fetcher = FetchEvents(startDateString, endDateString, lDongRegnCd, lDongSignguCd);
    } else {
      fetcher = FetchTourSpots(contentsType, lDongRegnCd, lDongSignguCd);
    }

    fetcher
      .then(setSpots)
      .catch((err: any) => setError(err.message))
      .finally(() => setLoading(false));

  }, [contentsType, lDongRegnCd, lDongSignguCd, eventDate, eventEndDate]); // [수정됨] 의존성 배열에 eventEndDate 추가

  return { spots, loading, error };
}