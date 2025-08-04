import { useState, useEffect, useMemo } from "react";
// useSearchParams 훅을 import 합니다.
import { Link, useSearchParams } from "react-router-dom";
import { useTouristSpots } from "../hooks/Tour_spots";
import SearchInput from "../tools/Search_Input";
import TouristSpotList from "../tools/Tour_list";
import Pagination from "../components/Pagination";
import AreaButton from "../components/AreaButton";
import ContentsTypeButton, { contentsTypeList } from "../components/ContentsTypeButton";
import { Area } from "../components/AreaButton";
import SigunguButton, { Sigungu } from "../components/SigunguButton";
import { FetchAreaCode, FetchSigunguCode } from "../api/FetchTourApi";

const formatDateForInput = (date: Date): string => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function PlaceInformation() {
  // URL 쿼리 파라미터를 읽기 위해 useSearchParams 훅을 사용합니다.
  const [searchParams] = useSearchParams();
  const planId = searchParams.get('planId'); // URL에서 planId를 가져옵니다.

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
  
  const [eventStartDate, setEventStartDate] = useState(new Date());
  const [eventEndDate, setEventEndDate] = useState<Date | null>(null);

  const { spots, loading, error } = useTouristSpots(
    currentAreaCode, 
    currentContentsType, 
    sigunguSelected ? currentSigunguCode : undefined,
    eventStartDate
  );

  const filteredSpots = useMemo(() => {
    let tempSpots = spots.filter(spot => 
      spot.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (currentContentsType === 15 && eventEndDate) {
      const endDateStr = formatDateForInput(eventEndDate).replace(/-/g, '');
      tempSpots = tempSpots.filter(spot => {
        return !spot.eventStartDate || spot.eventStartDate <= endDateStr;
      });
    }
    
    return tempSpots;
  }, [spots, searchQuery, currentContentsType, eventEndDate]);

  const totalPages = Math.ceil(filteredSpots.length / itemsPerPage);
  
  const currentSpots = useMemo(() => 
    filteredSpots.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage),
    [filteredSpots, currentPage, itemsPerPage]
  );

  useEffect(() => { FetchAreaCode().then(setAreaList); }, []);
  
  useEffect(() => {
    if (currentAreaCode && areaSelected) {
      FetchSigunguCode(currentAreaCode).then(setSigunguList);
      setSigunguSelected(false);
    }
  }, [currentAreaCode, areaSelected]);
  
  useEffect(() => { window.scrollTo({ top: 0 }); }, [currentPage]);
  
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, currentAreaCode, currentContentsType, currentSigunguCode, eventStartDate, eventEndDate]);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEventStartDate(new Date(e.target.value));
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEventEndDate(e.target.value ? new Date(e.target.value) : null);
  };

  return (
    <div>
      <h1>장소 정보 페이지</h1>
      <Link to="/"><button>홈으로</button></Link>

      <SearchInput value={searchQuery} onChange={setSearchQuery} />

      {/* 지역, 시군구, 카테고리 선택 UI (이전과 동일) */}
      {/* ... */}
      
      {loading && <p>로딩 중...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {!loading && !error && <p> 총 {filteredSpots.length}개의 장소가 검색되었습니다.</p>}

      {/* TouristSpotList에 planId를 prop으로 전달합니다. */}
      <TouristSpotList spots={currentSpots} planId={planId} />

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
