// /src/tools/Tour_list.tsx

import { TouristSpot } from "../api/FetchTourApi";

interface TouristSpotListProps {
  spots: TouristSpot[];
  planId: string | null; 
  visitDay: string | null; // [추가됨] visitDay prop 타입
}

export default function TouristSpotList({ spots, planId, visitDay }: TouristSpotListProps) {
  if (spots.length === 0) return <p>결과가 없습니다.</p>;

  return (
    <ul>
      {spots.map(({ id, name, imageUrl, description, contentTypeId }) => {

        // [수정됨] 상세 페이지 URL 생성 로직
        let detailUrl = `/detail/${id}/${contentTypeId}`;
        if (planId) {
          detailUrl += `?planId=${planId}`;
          // visitDay가 있을 경우에만 URL에 추가
          if (visitDay) {
            detailUrl += `&day=${visitDay}`;
          }
        }

        return (
          <li key={id}>
           <a
              href={detailUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <h3>{name}</h3>
            </a>
            {imageUrl && <img src={imageUrl} alt={name} width={200} />}
            <p>{description}</p>
          </li>
        );
      })}
    </ul>
  );
}