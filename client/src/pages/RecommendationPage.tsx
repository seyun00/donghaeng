// /src/pages/RecommendationPage.tsx

import React, { useState, useEffect } from 'react';
import { 
  FetchLDongRegions, 
  FetchSpotsByTaste, 
  TouristSpot, 
  CategoryItem, 
  FetchCategoryList,
  FetchCategoryMap,  
  CategoryMap
} from '../api/FetchTourApi';
import AreaButton, { Region } from '../components/AreaButton';
import TouristSpotList from '../tools/Tour_list';

// contentTypeId와 lclsSystm1 코드를 매핑
const lclsToContentTypeId: { [key: string]: string } = {
  'HS': '12', // 역사관광 -> 관광지
  'NA': '12', // 자연관광 -> 관광지
  'EX': '12', // 체험관광 -> 관광지
  'VE': '14', // 문화관광 -> 문화시설
  'LS': '28', // 레저스포츠 -> 레포츠
  'AC': '32', // 숙박 -> 숙박
  'SH': '38', // 쇼핑 -> 쇼핑
  'FD': '39', // 음식 -> 음식점
  'EV': '15', // 축제/행사 -> 축제
  'C01': '25', // 추천코스 -> 여행코스
};

interface SelectedKeyword {
  id: string; 
  name: string; 
  params: { 
    contentTypeId: string;
    lclsSystm1?: string;
    lclsSystm2?: string;
    lclsSystm3?: string;
  };
}

type RecommendationResults = {
  [keywordName: string]: TouristSpot[];
};

// API 파라미터를 동적으로 조립하는 헬퍼 함수
const buildTasteParams = (contentTypeId: string, code?: string) => {
  if (!code) return { contentTypeId };
  if (code.length === 2) return { contentTypeId, lclsSystm1: code };
  if (code.length === 4) return { contentTypeId, lclsSystm1: code.substring(0, 2), lclsSystm2: code };
  if (code.length === 8) return { contentTypeId, lclsSystm1: code.substring(0, 2), lclsSystm2: code.substring(0, 4), lclsSystm3: code };
  return { contentTypeId };
};

export default function RecommendationPage() {
  const [regionList, setRegionList] = useState<Region[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<number | undefined>();
  
  const [lvl1List, setLvl1List] = useState<CategoryItem[]>([]);
  const [selectedLvl1, setSelectedLvl1] = useState<string | undefined>();
  const [lvl2List, setLvl2List] = useState<CategoryItem[]>([]);
  const [selectedLvl2, setSelectedLvl2] = useState<string | undefined>();
  const [lvl3List, setLvl3List] = useState<CategoryItem[]>([]);
  
  const [selectedKeywords, setSelectedKeywords] = useState<SelectedKeyword[]>([]);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<RecommendationResults | null>(null);

  const [categoryMap, setCategoryMap] = useState<CategoryMap>({});

  // 페이지 로드 시 지역 목록, 전체 카테고리 맵, Lvl1 목록을 불러옴
  useEffect(() => {
    FetchLDongRegions().then(setRegionList);
    FetchCategoryMap().then(setCategoryMap);
    
    // lclsSystmCode2를 호출하여 Lvl1 목록을 가져옴
    FetchCategoryList({}).then(items => {
      const filteredItems = items.filter(item => item.code !== 'C01'); // "추천코스" 제외
      setLvl1List(filteredItems);
    });
  }, []);

  // Lvl1(대분류)이 바뀌면 Lvl2(중분류) 목록을 불러옴
  useEffect(() => {
    setLvl2List([]);
    setSelectedLvl2(undefined);
    setLvl3List([]);
    
    if (selectedLvl1) {
      FetchCategoryList({ lclsSystm1: selectedLvl1 }).then(setLvl2List);
    }
  }, [selectedLvl1]);

  // Lvl2(중분류)가 바뀌면 Lvl3(소분류) 목록을 불러옴
  useEffect(() => {
    setLvl3List([]);
    
    if (selectedLvl1 && selectedLvl2) {
      FetchCategoryList({ lclsSystm1: selectedLvl1, lclsSystm2: selectedLvl2 }).then(setLvl3List);
    }
  }, [selectedLvl2, selectedLvl1]);

  // 키워드 추가 핸들러 (lclsSystm 기반)
  const handleAddKeyword = (level: number, code: string, name: string) => {
    const lclsSystm1 = (level === 1) ? code : selectedLvl1!;
    const contentTypeId = lclsToContentTypeId[lclsSystm1];
    
    if (!contentTypeId) {
      alert("매핑되는 관광타입이 없습니다.");
      return;
    }

    const params = buildTasteParams(contentTypeId, code);
    const id = `${contentTypeId}_${code}`;
    
    let namePath = "";
    if (level === 1) namePath = name;
    if (level === 2) namePath = `${lvl1List.find(c => c.code === selectedLvl1)?.name || ''} > ${name}`;
    if (level === 3) namePath = `${lvl1List.find(c => c.code === selectedLvl1)?.name || ''} > ${lvl2List.find(c => c.code === selectedLvl2)?.name || ''} > ${name}`;

    const newKeyword: SelectedKeyword = { id, name: namePath, params };
    
    if (!selectedKeywords.find(k => k.id === newKeyword.id)) {
      setSelectedKeywords(prev => [...prev, newKeyword]);
    }
  };

  //  추천 받기 버튼 클릭 핸들러
  const handleRecommendClick = async () => {
    if (selectedKeywords.length === 0) {
      alert('취향 키워드를 1개 이상 추가해주세요.');
      return;
    }
    setLoading(true);
    setResults(null);
    const newResults: RecommendationResults = {};

    await Promise.all(
      selectedKeywords.map(async (keyword) => {
        const spots = await FetchSpotsByTaste(keyword.params, selectedRegion);
        newResults[keyword.name] = spots;
      })
    );
    setResults(newResults);
    setLoading(false);
  };

  const baseButtonClasses = "px-3 py-1.5 rounded-md font-semibold transition-colors duration-150 ease-in-out text-sm";
  const activeButtonClasses = "bg-indigo-600 text-white";
  const inactiveButtonClasses = "bg-gray-200 text-gray-700 hover:bg-gray-300";
  const addKeywordButtonClasses = "px-2 py-1 text-xs text-blue-500 hover:bg-blue-100 rounded-md ml-1";

  return (
    <div className="min-h-screen p-4 sm:p-6 md:p-8 bg-gray-50">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">맞춤 여행지 추천</h1>
        
        <div className="p-6 bg-white shadow-lg rounded-xl mb-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            1. 어디로 여행가시나요? (선택)
            {selectedRegion && (
              <button onClick={() => setSelectedRegion(undefined)} className="ml-4 text-sm text-red-500 hover:underline">
                (전국으로 다시 검색)
              </button>
            )}
          </h2>
          <div className="flex flex-wrap items-center gap-2">
            {regionList.map(region => (
              <AreaButton 
                key={region.id} 
                region={region}
                isActive={region.regionCode === selectedRegion}
                onClick={() => setSelectedRegion(region.regionCode)} 
              />
            ))}
          </div>
        </div>

        <div className="p-6 bg-white shadow-lg rounded-xl mb-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">2. 어떤 여행을 좋아하세요?</h2>
          
          {/* Lvl 1 (대분류) */}
          <div className="mb-4">
            <h3 className="font-medium text-gray-600 mb-2">대분류 (클릭: 중분류 보기 | +: 키워드 추가)</h3>
            <div className="flex flex-wrap items-center gap-2">
              {lvl1List.map(item => (
                <div key={item.code} className={`flex items-center rounded-md ${selectedLvl1 === item.code ? 'bg-indigo-100' : 'bg-gray-100'}`}>
                  <button
                    onClick={() => setSelectedLvl1(item.code)}
                    className={`${baseButtonClasses} ${selectedLvl1 === item.code ? 'text-indigo-700' : 'text-gray-700'}`}
                  >
                    {item.name}
                  </button>
                  <button onClick={() => handleAddKeyword(1, item.code, item.name)} className={addKeywordButtonClasses}>+</button>
                </div>
              ))}
            </div>
          </div>
          
          {/* Lvl 2 (중분류) */}
          {lvl2List.length > 0 && (
            <div className="border-t pt-4 mt-4 mb-4">
              <h3 className="font-medium text-gray-600 mb-2">중분류 (클릭: 소분류 보기 | +: 키워드 추가)</h3>
              <div className="flex flex-wrap items-center gap-2">
                {lvl2List.map(item => (
                  <div key={item.code} className={`flex items-center rounded-md ${selectedLvl2 === item.code ? 'bg-indigo-100' : 'bg-gray-100'}`}>
                    <button
                      onClick={() => setSelectedLvl2(item.code)}
                      className={`${baseButtonClasses} ${selectedLvl2 === item.code ? 'text-indigo-700' : 'text-gray-700'}`}
                    >
                      {item.name}
                    </button>
                    <button onClick={() => handleAddKeyword(2, item.code, item.name)} className={addKeywordButtonClasses}>+</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Lvl 3 (소분류) */}
          {lvl3List.length > 0 && (
            <div className="border-t pt-4 mt-4 mb-4">
              <h3 className="font-medium text-gray-600 mb-2">소분류 (+ 눌러 키워드 추가)</h3>
              <div className="flex flex-wrap items-center gap-2">
                {lvl3List.map(item => (
                  <div key={item.code} className="flex items-center rounded-md bg-gray-100">
                    <span className="px-3 py-1.5 text-sm text-gray-700">{item.name}</span>
                    <button onClick={() => handleAddKeyword(3, item.code, item.name)} className={addKeywordButtonClasses}>+</button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="p-6 bg-white shadow-lg rounded-xl mb-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">선택된 나의 취향</h2>
          {selectedKeywords.length > 0 ? (
            <div className="flex flex-wrap items-center gap-2 mb-6">
              {selectedKeywords.map(kw => (
                <span key={kw.id} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                  {kw.name}
                  <button 
                    onClick={() => setSelectedKeywords(prev => prev.filter(k => k.id !== kw.id))}
                    className="ml-2 text-red-500 hover:text-red-700 font-bold"
                  >
                    &times;
                  </button>
                </span>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 mb-6">위에서 원하는 여행 취향의 '+' 버튼을 눌러 추가해주세요.</p>
          )}

          <div className="text-center">
            <button
              onClick={handleRecommendClick}
              disabled={loading || selectedKeywords.length === 0}
              className="px-12 py-4 text-xl font-bold text-white bg-blue-600 rounded-lg shadow-lg hover:bg-blue-700 transition-transform hover:scale-105 disabled:bg-gray-400 disabled:scale-100"
            >
              {loading ? '추천 찾는 중...' : '여행지 추천 받기'}
            </button>
          </div>
        </div>

        {results && (
          <div className="space-y-8">
            {Object.keys(results).length === 0 && !loading && (
              <p className="text-gray-500 text-center py-4 bg-white rounded-lg shadow-sm">
                추천 장소를 찾지 못했습니다.
              </p>
            )}
            {Object.entries(results).map(([keywordName, spots]) => (
              <div key={keywordName}>
                <h3 className="text-2xl font-bold mb-4">'{keywordName}' 취향저격 여행지</h3>
                {spots.length > 0 ? (
                  <TouristSpotList 
                    spots={spots} 
                    planId={null} 
                    visitDay={null}
                    categoryMap={categoryMap}
                  />
                ) : (
                  <p className="text-gray-500 text-center py-4 bg-white rounded-lg shadow-sm">
                    '{keywordName}'에 대한 {selectedRegion ? regionList.find(r => r.regionCode === selectedRegion)?.regionName : '전국'} 추천 장소를 찾지 못했습니다.
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}