import { TouristSpot } from "../api/FetchTourApi";
import { Link } from "react-router-dom";

interface TouristSpotListProps {
  spots: TouristSpot[];
}

export default function TouristSpotList({ spots }: TouristSpotListProps) {
  if (spots.length === 0) return <p>결과가 없습니다.</p>;

  return (
    <ul>
      {spots.map(({ id, name, imageUrl, description, contentTypeId }) => (
        <li key={id}>
          {/* Link -> a 태그로 변경하고 target="_blank" 추가 */}
          <a
            href={`/detail/${id}/${contentTypeId}`}
            target="_blank"
            rel="noopener noreferrer" // 보안을 위해 rel 속성을 추가하는 것이 좋습니다.
          >
            <h3>{name}</h3>
          </a>
          {imageUrl && <img src={imageUrl} alt={name} width={200} />}
          <p>{description}</p>
        </li>
      ))}
    </ul>
  );
}interface TouristSpotListProps {
  spots: TouristSpot[];
}