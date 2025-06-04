import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTouristSpots } from "../hooks/Tour_spots";
import AreaSelector from "../tools/Area_select";
import SearchInput from "../tools/Search_Input";
import TouristSpotList from "../tools/Tour_list";
import { FetchAreaCode } from "../api/FetchTourApi";
import AreaButton from "../components/AreaButton";
import { Area } from "../components/AreaButton";

export default function PlaceInformation() {
  const [searchQuery, setSearchQuery] = useState("");
  const [areaCode, setAreaCode] = useState(1);
  const [serviceCategory, setServiceCategory] = useState(12);

  const { spots, loading, error } = useTouristSpots(areaCode); // 커스텀 훅 사용

  const filteredSpots = spots.filter(spot =>
    spot.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const [areaList, setAreaList] = useState<Area[]>([]);

  useEffect(() => {
    FetchAreaCode().then(setAreaList);
  }, []);

  return (
    <div>
      <h1>관광지 정보 페이지</h1>
      <Link to="/"><button>홈으로</button></Link>

      {/* 셀렉터 대신 지역 선택 버튼으로 바꿈 */}
      {/* <AreaSelector areaCode={areaCode} onChange={setAreaCode} /> */}
      <SearchInput value={searchQuery} onChange={setSearchQuery} />
      
      <br />
      <br />
      <div>
        지역 선택 : {areaList.map((item:any) => 
        (<AreaButton area={item} key={item.id} onClick={()=>setAreaCode(item.areaCode)}/>)
      )}
      </div>
      <div>
        카테고리 선택 : 
      </div>

      {loading && <p>로딩 중...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      <TouristSpotList spots={filteredSpots} />
    </div>
  );
}
