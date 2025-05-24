import { useState } from "react";
import { Link } from "react-router-dom";
import { useTouristSpots } from "../hooks/Tour_spots";
import AreaSelector from "../tools/Area_select";
import SearchInput from "../tools/Search_Input";
import TouristSpotList from "../tools/Tour_list";

export default function PlaceInformation() {
  const [searchQuery, setSearchQuery] = useState("");
  const [areaCode, setAreaCode] = useState(1);

  const { spots, loading, error } = useTouristSpots(areaCode); // 커스텀 훅 사용

  const filteredSpots = spots.filter(spot =>
    spot.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <h1>관광지 정보 페이지</h1>
      <Link to="/"><button>홈으로</button></Link>

      <AreaSelector areaCode={areaCode} onChange={setAreaCode} />
      <SearchInput value={searchQuery} onChange={setSearchQuery} />

      {loading && <p>로딩 중...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      <TouristSpotList spots={filteredSpots} />
    </div>
  );
}
