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
  <div className="min-h-screen p-4 bg-gray-50 sm:p-8">
    <div className="mx-auto max-w-7xl">
      <div className="flex items-center justify-center mb-8">
        <div className="text-3xl font-bold text-gray-800">관광 정보 검색</div>
      </div>
      <div className="flex flex-col gap-8 md:flex-row">
        <div className="flex-1">
          <div className="flex justify-center mb-8">
            {/* 검색창: 넓이/배경/라운드/테두리 및 포커스 */}
            <div className="w-full max-w-xl">
              <SearchInput
                value={searchQuery}
                onChange={setSearchQuery}
                className="w-full px-5 py-3 text-lg transition bg-white border border-blue-300 shadow rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="관광지 이름을 검색하세요"
              />
            </div>
          </div>
          <div className="mb-6">
            <div className="flex flex-wrap justify-center gap-2 pb-2 overflow-x-auto">
              {contentsTypeList.map(item => (
                <ContentsTypeButton
                  key={item.typeID}
                  typeID={item.typeID}
                  typeName={item.typeName}
                  isActive={item.typeID === currentContentsType}
                  onClick={() => setCurrentContentsType(item.typeID)}
                  className="text-xs whitespace-nowrap min-w-20 max-w-32"
                />
              ))}
            </div>
          </div>
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
        <aside className="w-full p-6 space-y-6 bg-white shadow-lg md:w-72 xl:w-80 shrink-0 rounded-xl h-fit">
          {/* 지역 선택 */}
          <div>
            <span className="block mb-2 font-semibold text-center text-gray-700">지역 선택</span>
            <div className="flex flex-wrap justify-center gap-2">
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
                  className="text-xs whitespace-nowrap min-w-20 max-w-32"
                />
              ))}
            </div>
          </div>
          {/* 시군구 선택 */}
          {regionSelected && sigunguList.length > 0 && (
            <div>
              <span className="block mb-2 font-semibold text-center text-gray-700">시군구 선택</span>
              <div className="flex flex-wrap justify-center gap-2">
                {sigunguList.map(item => (
                  <SigunguButton
                    key={item.id}
                    sigungu={item}
                    isActive={item.sigunguCode === currentSigunguCode && sigunguSelected}
                    onClick={() => {
                      setCurrentSigunguCode(item.sigunguCode);
                      setSigunguSelected(true);
                    }}
                    className="text-xs whitespace-nowrap min-w-20 max-w-32"
                  />
                ))}
              </div>
            </div>
          )}
          {currentContentsType === 15 && (
            <div className="pt-2 space-y-2">
              <div>
                <label htmlFor="event-start-date" className="mr-2 font-semibold text-gray-700">행사 시작일:</label>
                <input
                  type="date"
                  id="event-start-date"
                  value={formatDateForInput(eventStartDate)}
                  onChange={handleDateChange}
                  className="p-2 border-gray-300 rounded-md shadow-sm"
                />
              </div>
              <div>
                <label htmlFor="event-end-date" className="mr-2 font-semibold text-gray-700">종료일 (선택):</label>
                <input
                  type="date"
                  id="event-end-date"
                  value={eventEndDate ? formatDateForInput(eventEndDate) : ''}
                  onChange={handleEndDateChange}
                  className="p-2 border-gray-300 rounded-md shadow-sm"
                />
                <button
                  onClick={() => setEventEndDate(null)}
                  className="px-3 py-2 ml-2 text-sm font-semibold text-gray-800 bg-gray-200 rounded-lg hover:bg-gray-300"
                >
                  초기화
                </button>
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  </div>
);



}