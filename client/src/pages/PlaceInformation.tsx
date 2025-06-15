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
import { FetchAreaCode, FetchSigunguCode, TouristSpot } from "../api/FetchTourApi";

export default function PlaceInformation() {

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

  // 현재 페이지 기준 itemsPerPage 개수만큼 장소 리스트 출력
  const [currentSpots, setCurrentSpots] = useState<TouristSpot[]>([]);
  
  useEffect(() => {
    const spots = filteredSpots.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );
    setCurrentSpots(spots);
  }, [filteredSpots, currentPage, itemsPerPage]);

  useEffect(() => {
    window.scrollTo({ top: 0});
  }, [currentPage]);
  
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, currentAreaCode, currentContentsType, currentSigunguCode]);

  return (
    <div>
      <h1>장소 정보 페이지</h1>
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

      {!loading && !error && 
        <p> 총 {filteredSpots.length}개의 장소가 검색되었습니다.</p>
      }

      <TouristSpotList spots={currentSpots} />
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
      
    </div>
  );
}
