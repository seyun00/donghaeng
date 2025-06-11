import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTouristSpots } from "../hooks/Tour_spots";
import SearchInput from "../tools/Search_Input";
import TouristSpotList from "../tools/Tour_list";
import Pagination from "../components/Pagination";
import AreaButton from "../components/AreaButton";
import ContentsTypeButton, { contentsTypeList } from "../components/ContentsTypeButton";
import { Area } from "../components/AreaButton";
import SigunguButton, { Sigungu } from "../components/SigunguButton";
import { FetchAreaCode, FetchSigunguCode } from "../api/FetchTourApi";

export default function PlaceInformation() {
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");

  const [currentAreaCode, setCurrentAreaCode] = useState(1);
  const [areaSelected, setAreaSelected] = useState(false);
  const [currentSigunguCode, setCurrentSigunguCode] = useState(1);
  const [sigunguSelected, setSigunguSelected] = useState(false);

  const [currentContentsType, setCurrentContentsType] = useState(12);
  const [areaList, setAreaList] = useState<Area[]>([]);
  const [sigunguList, setSigunguList] = useState<Sigungu[]>([]);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { spots, loading, error } = useTouristSpots(
    currentAreaCode, 
    currentContentsType, 
    sigunguSelected ? currentSigunguCode : undefined
  );

  const filteredSpots = spots.filter(spot =>
    spot.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredSpots.length / itemsPerPage);
  
  useEffect(() => {
    FetchAreaCode().then(setAreaList);
  }, []);

  useEffect(() => {
    if (currentAreaCode && areaSelected) {
      FetchSigunguCode(currentAreaCode).then(setSigunguList);
      setSigunguSelected(false)
    }
  }, [currentAreaCode]);

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
            onClick={() => {
              setCurrentAreaCode(item.areaCode)
              setAreaSelected(true)
            }}
          />
        ))}
      </div>

      {areaSelected && 
        <div>
          시군구선택 :  {sigunguList.map(item => (
            <SigunguButton
              key={item.id}
              sigungu={item}
              onClick={() => {
                setCurrentSigunguCode(item.sigunguCode) 
                setSigunguSelected(true)
              }}
            />
          ))}
        </div>
      }
      <br />

      <div>
        카테고리 선택 :
        {contentsTypeList.map(item => (
          <ContentsTypeButton
            key={item.typeID}
            typeID={item.typeID}
            typeName={item.typeName}
            onClick={() => setCurrentContentsType(item.typeID)}
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
