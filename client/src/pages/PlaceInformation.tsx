import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTouristSpots } from "../hooks/Tour_spots";
import SearchInput from "../tools/Search_Input";
import TouristSpotList from "../tools/Tour_list";
import Pagination from "../components/Pagination";
import AreaButton from "../components/AreaButton";
import ContentsTypeButton, { contentsTypeList } from "../components/ContentsTypeButton";
import { Area } from "../components/AreaButton";
import { FetchAreaCode } from "../api/FetchTourApi";

export default function PlaceInformation() {
  const navigate = useNavigate();

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
  
  useEffect(() => {
    FetchAreaCode().then(setAreaList);
  }, []);

  // 지역/카테고리/검색 변경 시 항상 첫 페이지 기준으로 필터링
  const currentSpots = filteredSpots.slice(0, itemsPerPage);

  const handlePageChange = (page: number) => {
    const nextSpots = filteredSpots.slice(
      (page - 1) * itemsPerPage,
      page * itemsPerPage
    );

    const firstSpot = nextSpots[0];

    if (firstSpot && firstSpot.id && firstSpot.contentTypeId) {
      navigate(`/detail/${firstSpot.id}/${firstSpot.contentTypeId}`);
    }
  };

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
