import { TouristSpot } from "../api/FetchTourApi";
import { Link } from "react-router-dom";

interface TouristSpotListProps {
  spots: TouristSpot[];
}

export default function TouristSpotList({ spots }: TouristSpotListProps) {
  if (spots.length === 0) return <p>결과가 없습니다.</p>;

  return (
    <ul>
      {spots.map(({ id, name, imageUrl, description }) => (
        <li key={id}>
          <Link to={`/spot/${id}`}>
            <h3>{name}</h3>
          </Link>
          {imageUrl && <img src={imageUrl} alt={name} width={200} />}
          <p>{description}</p>
        </li>
      ))}
    </ul>
  );
}