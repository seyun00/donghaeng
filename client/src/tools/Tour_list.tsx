import { TouristSpot } from "../api/FetchTourApi";

interface TouristSpotListProps {
  spots: TouristSpot[];
  planId: string | null; 
}

export default function TouristSpotList({ spots, planId }: TouristSpotListProps) {
  if (spots.length === 0) return <p>결과가 없습니다.</p>;

  return (
    <ul>
      {spots.map(({ id, name, imageUrl, description, contentTypeId }) => {

        const detailUrl = planId
          ? `/detail/${id}/${contentTypeId}?planId=${planId}`
          : `/detail/${id}/${contentTypeId}`;

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
