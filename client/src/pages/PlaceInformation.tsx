// /src/pages/PlaceInformation.tsx

import { useState, useEffect, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useTouristSpots } from "../hooks/Tour_spots";
import SearchInput from "../tools/Search_Input";
import TouristSpotList from "../tools/Tour_list";
import Pagination from "../components/Pagination";
import AreaButton, { Region } from "../components/AreaButton";
import ContentsTypeButton, { contentsTypeList } from "../components/ContentsTypeButton";
import SigunguButton, { Sigungu } from "../components/SigunguButton";
// FetchCategoryMap을 import
import { FetchLDongRegions, FetchLDongSigungus, FetchCategoryMap, CategoryMap } from "../api/FetchTourApi"; 

const formatDateForInput = (date: Date): string => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function PlaceInformation() {
  const [searchParams] = useSearchParams();
  const planId = searchParams.get('planId');
  const visitDay = searchParams.get('day'); 
  const typeIdParam = searchParams.get('typeId');

  const [searchQuery, setSearchQuery] = useState("");
  const [currentRegionCode, setCurrentRegionCode] = useState<number | undefined>(11);
  const [regionSelected, setRegionSelected] = useState(false);
  const [currentSigunguCode, setCurrentSigunguCode] = useState<number | undefined>();
  const [sigunguSelected, setSigunguSelected] = useState(false);
  const [currentContentsType, setCurrentContentsType] = useState(
    typeIdParam ? parseInt(typeIdParam) : 12
  );
  const [regionList, setRegionList] = useState<Region[]>([]);
  const [sigunguList, setSigunguList] = useState<Sigungu[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const [eventStartDate, setEventStartDate] = useState(new Date('2024-01-01'));
  const [eventEndDate, setEventEndDate] = useState<Date | null>(null);

  const [categoryMap, setCategoryMap] = useState<CategoryMap>({});

  const { spots, loading, error } = useTouristSpots(
    currentContentsType,
    currentRegionCode,
    sigunguSelected ? currentSigunguCode : undefined,
    eventStartDate,
    eventEndDate
  );

  const filteredSpots = useMemo(() => {
    return spots.filter(spot => 
      spot.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [spots, searchQuery]);

  const totalPages = Math.ceil(filteredSpots.length / itemsPerPage);
  
  const currentSpots = useMemo(() => 
    filteredSpots.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage),
    [filteredSpots, currentPage, itemsPerPage]
  );

  useEffect(() => { 
    FetchLDongRegions().then(setRegionList); 
    FetchCategoryMap().then(setCategoryMap);
  }, []); 
  
  useEffect(() => {
    if (currentRegionCode && regionSelected) {
      FetchLDongSigungus(currentRegionCode).then(setSigunguList);
      setSigunguSelected(false);
      setCurrentSigunguCode(undefined);
    }
  }, [currentRegionCode, regionSelected]);
  
  useEffect(() => { window.scrollTo({ top: 0 }); }, [currentPage]);
  
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, currentRegionCode, currentSigunguCode, currentContentsType, eventStartDate, eventEndDate]);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEventStartDate(new Date(e.target.value));
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEventEndDate(e.target.value ? new Date(e.target.value) : null);
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 md:p-8 bg-gray-50">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800 sm:text-3xl">관광 장소 정보 페이지 </h1>
          {/* <Link to="/">
            <button className="px-4 py-2 font-bold text-white transition-colors bg-blue-500 rounded-lg shadow-md hover:bg-blue-600">
              홈으로
            </button>
          </Link> */}
        </div>

        <div className="p-6 space-y-6 bg-white shadow-lg rounded-xl">
          <SearchInput value={searchQuery} onChange={setSearchQuery} />

          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-2 font-semibold text-gray-700">지역 선택 :</span>
            {regionList.map(item => (
              <AreaButton 
                key={item.id} 
                region={item}
                isActive={item.regionCode === currentRegionCode}
                onClick={() => { 
                  setCurrentRegionCode(item.regionCode); 
                  setRegionSelected(true); 
                  setSigunguList([]); 
                  setCurrentSigunguCode(undefined); 
                  setSigunguSelected(false); 
                }} 
              />
            ))}
          </div>

          {regionSelected && sigunguList.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="mr-2 font-semibold text-gray-700">시군구 선택 :</span>
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
          
          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-2 font-semibold text-gray-700">카테고리 선택 :</span>
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

          {currentContentsType === 15 && (
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <div>
                <label htmlFor="event-start-date" className="mr-2 font-semibold text-gray-700">행사 시작일: </label>
                <input 
                  type="date" 
                  id="event-start-date" 
                  value={formatDateForInput(eventStartDate)} 
                  onChange={handleDateChange} 
                  className="p-2 border-gray-300 rounded-md shadow-sm"
                />
              </div>
              
              <div>
                <label htmlFor="event-end-date" className="mr-2 font-semibold text-gray-700">종료일 (선택): </label>
                <input 
                  type="date" 
                  id="event-end-date" 
                  value={eventEndDate ? formatDateForInput(eventEndDate) : ''} 
                  onChange={handleEndDateChange} 
                  className="p-2 border-gray-300 rounded-md shadow-sm"
                />
                <button 
                  onClick={() => setEventEndDate(null)} 
                  className="px-3 py-2 ml-2 text-sm font-semibold text-gray-800 transition-colors bg-gray-200 rounded-lg hover:bg-gray-300"
                >
                  초기화
                </button>
              </div>
            </div>
          )}
        </div>
        
        <div className="mt-8">
          {loading && <p className="text-center text-gray-500">로딩 중...</p>}
          {error && <p className="font-semibold text-center text-red-500">{error}</p>}
          {!loading && !error && (
            <p className="mb-4 text-lg text-gray-600"> 
              총 <span className="font-bold text-blue-600">{filteredSpots.length}</span>개의 장소가 검색되었습니다.
            </p>
          )}

          
          <TouristSpotList 
            spots={currentSpots} 
            planId={planId} 
            visitDay={visitDay}
            categoryMap={categoryMap}
          />

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