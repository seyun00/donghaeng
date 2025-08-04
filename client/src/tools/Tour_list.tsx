import { TouristSpot } from "../api/FetchTourApi";
// Link는 더 이상 사용하지 않으므로 import 문을 삭제해도 됩니다.

interface TouristSpotListProps {
  spots: TouristSpot[];
  planId: string | null; // planId를 prop으로 받습니다.
}

export default function TouristSpotList({ spots, planId }: TouristSpotListProps) {
  if (spots.length === 0) return <p>결과가 없습니다.</p>;

  return (
    <ul>
      {spots.map(({ id, name, imageUrl, description, contentTypeId }) => {
        // 상세 페이지로 이동할 URL을 동적으로 생성합니다.
        const detailUrl = planId
          ? `/detail/${id}/${contentTypeId}?planId=${planId}`
          : `/detail/${id}/${contentTypeId}`;

        return (
          <li key={id}>
            {/* a 태그의 href에 planId가 포함된 URL을 사용합니다. */}
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
