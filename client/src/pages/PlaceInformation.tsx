import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTouristSpots } from "../hooks/Tour_spots";
import AreaSelector from "../tools/Area_select";
import SearchInput from "../tools/Search_Input";
import TouristSpotList from "../tools/Tour_list";
import { FetchAreaCode } from "../api/FetchTourApi";
import AreaButton from "../components/AreaButton";
import { Area } from "../components/AreaButton";
import ContentsTypeButton from "../components/ContentsTypeButton";
import { contentsTypeList } from "../components/ContentsTypeButton";
import { contentsType } from "../components/ContentsTypeButton";

export default function PlaceInformation() {
  const [searchQuery, setSearchQuery] = useState("");
  const [areaCode, setAreaCode] = useState(1); // 지역코드, default : 서울

  const [contentsType, setContentsType] = useState(12); // 콘텐츠타입 코드, default : 관광지지

  const { spots, loading, error } = useTouristSpots(areaCode, contentsType); // 커스텀 훅 사용

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

      {/* 지역 선택 버튼 */}
      <div>
        지역 선택 : {areaList.map((item:any) => 
        (<AreaButton 
          area={item} 
          key={item.id}
          onClick={()=>setAreaCode(item.areaCode)}
          />))}
      </div>

      {/* 서비스 타입 선택 버튼*/}
      <div>
        카테고리 선택 : {contentsTypeList.map((item:contentsType) => 
          ( <ContentsTypeButton 
              key={item.typeID}
              typeID={item.typeID} 
              typeName={item.typeName}
              onClick={()=>setContentsType(item.typeID)}
            />))}
      </div>

      {loading && <p>로딩 중...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      <TouristSpotList spots={filteredSpots} />
    </div>
  );
}
