import { TouristSpot } from "../api/FetchTourApi";

interface TouristSpotListProps {
  spots: TouristSpot[];
}

export default function TouristSpotList({ spots }: TouristSpotListProps) {
  if (spots.length === 0) return <p>결과가 없습니다.</p>;

  return (
    <ul>
      {spots.map(({ id, name, imageUrl, description, location }) => (
        <li key={id}>
          <h3>{name}</h3>
          {imageUrl && <img src={imageUrl} alt={name} width={200} />}
          <p>{description}</p>
          <p><strong>위치:</strong> {location}</p>
        </li>
      ))}
    </ul>
  );
}
export {};