import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTouristSpots } from "../hooks/Tour_spots";
import SearchInput from "../tools/Search_Input";
import TouristSpotList from "../tools/Tour_list";
import Pagination from "../components/Pagination";
import AreaButton from "../components/AreaButton";
import ContentsTypeButton, { contentsTypeList } from "../components/ContentsTypeButton";
import { Area } from "../components/AreaButton";
import { FetchAreaCode } from "../api/FetchTourApi";

export default function PlaceInformation() {
  const [searchQuery, setSearchQuery] = useState("");
  const [areaCode, setAreaCode] = useState(1);
  const [contentsType, setContentsType] = useState(12);
  const [areaList, setAreaList] = useState<Area[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { spots, loading, error } = useTouristSpots(areaCode, contentsType);
  const filteredSpots = spots.filter(spot =>
    spot.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredSpots.length / itemsPerPage);
  const currentSpots = filteredSpots.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    FetchAreaCode().then(setAreaList);
  }, []);

  useEffect(() => {
    setCurrentPage(1); // 지역 또는 콘텐츠 타입 변경 시 페이지 초기화
  }, [areaCode, contentsType, searchQuery]);

  return (
    <div>
      <h1>관광지 정보 페이지</h1>
      <Link to="/"><button>홈으로</button></Link>

      <SearchInput value={searchQuery} onChange={setSearchQuery} />

      <div>
        지역 선택 :
        {areaList.map(item => (
          <AreaButton
            key={item.id}
            area={item}
            onClick={() => setAreaCode(item.areaCode)}
          />
        ))}
      </div>

      <div>
        카테고리 선택 :
        {contentsTypeList.map(item => (
          <ContentsTypeButton
            key={item.typeID}
            typeID={item.typeID}
            typeName={item.typeName}
            onClick={() => setContentsType(item.typeID)}
          />
        ))}
      </div>

      {loading && <p>로딩 중...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      <TouristSpotList spots={currentSpots} />
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
