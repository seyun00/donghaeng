import { Link } from "react-router-dom";
import { useTouristSpots } from "../hooks/Tour_spots";
import { useParams } from "react-router-dom";

export default function SpotDetail() {
  const { id } = useParams<{ id: string }>();
  const { spots } = useTouristSpots(0, 0); // 전체 불러오기용
  const spot = spots.find(spot => String(spot.id) === id);

  if (!spot) return <p>해당 관광지를 찾을 수 없습니다.</p>;

  return (
    <div>
      <h1>{spot.name}</h1>
      {spot.imageUrl && <img src={spot.imageUrl} alt={spot.name} />}
      <p>{spot.description}</p>
      <p><strong>위치:</strong> {spot.location}</p>
      <Link to="/placeInformation"><button>목록으로</button></Link>
    </div>
  );
}
export{}