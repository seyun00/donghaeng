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
  const [searchParams] = useSearchParams();
  const planId = searchParams.get('planId'); 

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
    // 전체 컨테이너에 패딩과 배경색 추가
    <div className="p-4 sm:p-6 md:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">관광 장소 정보 페이지 </h1>
          <Link to="/">
            <button className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition-colors shadow-md">
              홈으로
            </button>
          </Link>
        </div>

        <div className="space-y-6 bg-white p-6 rounded-xl shadow-lg">
          <SearchInput value={searchQuery} onChange={setSearchQuery} />

          {/* 지역 선택 */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-gray-700 mr-2">지역 선택 :</span>
            {areaList.map(item => (
              <AreaButton 
                key={item.id} 
                area={item}
                isActive={item.areaCode === currentAreaCode}
                onClick={() => { 
                  setCurrentAreaCode(item.areaCode); 
                  setAreaSelected(true); 
                  setSigunguList([]); 
                  setCurrentSigunguCode(1); 
                  setSigunguSelected(false); 
                }} 
              />
            ))}
          </div>

          {/* 시군구 선택 */}
          {areaSelected && sigunguList.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold text-gray-700 mr-2">시군구 선택 :</span>
              {sigunguList.map(item => (
                <SigunguButton 
                  key={item.id} 
                  sigungu={item} 
                  isActive={item.sigunguCode === currentSigunguCode && sigunguSelected}
                  onClick={() => { 
                    setCurrentSigunguCode(item.sigunguCode); 
                    setSigunguSelected(true); 
                  }} 
                />
              ))}
            </div>
          )}
          
          {/* 카테고리 선택 */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-gray-700 mr-2">카테고리 선택 :</span>
            {contentsTypeList.map(item => (
              <ContentsTypeButton 
                key={item.typeID} 
                typeID={item.typeID} 
                typeName={item.typeName}
                isActive={item.typeID === currentContentsType}
                onClick={() => setCurrentContentsType(item.typeID)} 
              />
            ))}
          </div>

          {/* 날짜 선택 (축제/공연/행사) */}
          {currentContentsType === 15 && (
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <div>
                <label htmlFor="event-start-date" className="font-semibold text-gray-700 mr-2">행사 시작일: </label>
                {/* 날짜 입력 필드 스타일링 */}
                <input 
                  type="date" 
                  id="event-start-date" 
                  value={formatDateForInput(eventStartDate)} 
                  onChange={handleDateChange} 
                  className="border-gray-300 rounded-md shadow-sm p-2"
                />
              </div>
              
              <div>
                <label htmlFor="event-end-date" className="font-semibold text-gray-700 mr-2">종료일 (선택): </label>
                <input 
                  type="date" 
                  id="event-end-date" 
                  value={eventEndDate ? formatDateForInput(eventEndDate) : ''} 
                  onChange={handleEndDateChange} 
                  className="border-gray-300 rounded-md shadow-sm p-2"
                />
                {/* 초기화 버튼 스타일링 */}
                <button 
                  onClick={() => setEventEndDate(null)} 
                  className="ml-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-3 rounded-lg transition-colors text-sm"
                >
                  초기화
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* 결과 표시 */}
        <div className="mt-8">
          {loading && <p className="text-center text-gray-500">로딩 중...</p>}
          {error && <p className="text-center text-red-500 font-semibold">{error}</p>}
          {!loading && !error && (
            <p className="text-lg text-gray-600 mb-4"> 
              총 <span className="font-bold text-blue-600">{filteredSpots.length}</span>개의 장소가 검색되었습니다.
            </p>
          )}

          <TouristSpotList spots={currentSpots} planId={planId} />

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>
    </div>
  );
}
