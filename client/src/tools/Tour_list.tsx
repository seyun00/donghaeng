import { TouristSpot } from "../api/FetchTourApi";
import { Link } from "react-router-dom";

interface TouristSpotListProps {
  spots: TouristSpot[];
}

export default function TouristSpotList({ spots }: TouristSpotListProps) {
  if (spots.length === 0) return <p>결과가 없습니다.</p>;

  return (
    <ul>
      {/* map에서 contentTypeId도 함께 받아옵니다. */}
      {spots.map(({ id, name, imageUrl, description, contentTypeId }) => (
        <li key={id}>
          {/* Link의 to 속성을 수정하여 id와 contentTypeId를 모두 전달합니다. */}
          <Link to={`/detail/${id}/${contentTypeId}`}>
            <h3>{name}</h3>
          </Link>
          {imageUrl && <img src={imageUrl} alt={name} width={200} />}
          <p>{description}</p>
        </li>
      ))}
    </ul>
  );
}