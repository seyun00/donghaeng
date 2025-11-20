// /src/api/FetchTourApi.ts

const TOURAPI_KEY = process.env.REACT_APP_TOURAPI_KEY;
const decodedKey = decodeURIComponent(TOURAPI_KEY || "");

async function apiClient(operation: string, additionalParams: Record<string, string> = {}) {
  const baseUrl = '/api/'; 
  const url = new URL(baseUrl + operation, window.location.origin); 
  const baseParams = {
    serviceKey: decodedKey, 
    MobileOS: 'ETC',
    MobileApp: 'TourApp',
    _type: 'json',
  };
  const params = { ...baseParams, ...additionalParams };
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.append(key, value);
    }
  });
  try {
    const res = await fetch(url.toString());
    if (!res.ok) {
        const errorText = await res.text();
        console.error("API 응답 에러:", errorText);
        throw new Error(`API 요청 실패: ${res.status} ${res.statusText}. 응답: ${errorText}`);
    }
    return await res.json();
  } catch (error) {
    console.error(`API Error in operation ${operation}:`, error);
    throw error;
  }
}

export interface TouristSpot {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  location: string;
  contentTypeId: string; 
  eventStartDate?: string; 
  lclsSystm1?: string;
  lclsSystm2?: string;
  lclsSystm3?: string;
}

export interface CategoryItem {
  code: string;
  name: string;
}
export interface CategoryMap {
  [code: string]: string;
}

// PlaceInformation용: 전체 카테고리 맵을 한 번에 생성
export async function FetchCategoryMap(): Promise<CategoryMap> {
  const data = await apiClient('lclsSystmCode2', {
    numOfRows: '1000',
    lclsSystmListYn: 'Y', // "Y"로 설정하여 전체 목록 조회
  });
  const items = data.response?.body?.items?.item ?? [];
  const categoryMap: CategoryMap = {};
  items.forEach((item: any) => {
    if (item.lclsSystm1Cd) categoryMap[item.lclsSystm1Cd] = item.lclsSystm1Nm;
    if (item.lclsSystm2Cd) categoryMap[item.lclsSystm2Cd] = item.lclsSystm2Nm;
    if (item.lclsSystm3Cd) categoryMap[item.lclsSystm3Cd] = item.lclsSystm3Nm;
  });
  return categoryMap;
}

// RecommendationPage용: 계층형 목록 조회
export async function FetchCategoryList(params: {
  lclsSystm1?: string;
  lclsSystm2?: string;
}): Promise<CategoryItem[]> {
  const apiParams: Record<string, string> = {
    numOfRows: '1000',
    lclsSystmListYn: 'N', // 'N'으로 설정하여 코드 조회
  };
  if (params.lclsSystm1) apiParams.lclsSystm1 = params.lclsSystm1;
  if (params.lclsSystm2) apiParams.lclsSystm2 = params.lclsSystm2;

  const data = await apiClient('lclsSystmCode2', apiParams);
  const items = data.response?.body?.items?.item ?? [];
  return items.map((item: any) => ({
    code: item.code,
    name: item.name,
  }));
}

export async function FetchSpotsByTaste(
  lclsParams: { contentTypeId: string; lclsSystm1?: string; lclsSystm2?: string; lclsSystm3?: string },
  areaCode?: number
): Promise<TouristSpot[]> {
  const params: Record<string, any> = {
    numOfRows: '10', 
    pageNo: '1',
    arrange: 'B', 
    lDongRegnCd: areaCode?.toString(),
    ...lclsParams, 
  };
  const validParams = Object.fromEntries(Object.entries(params).filter(([_, v]) => v != null));
  const data = await apiClient('areaBasedList2', validParams);
  const items = data.response?.body?.items?.item ?? [];
  return items.map((item: any) => ({
    id: item.contentid,
    name: item.title,
    description: item.addr1 || '설명 없음',
    imageUrl: item.firstimage || '',
    location: item.addr1 || '위치 정보 없음',
    contentTypeId: item.contenttypeid?.toString() || '',
    lclsSystm1: item.lclsSystm1,
    lclsSystm2: item.lclsSystm2,
    lclsSystm3: item.lclsSystm3,
  }));
}

export async function FetchTourSpots(
  contentsType: number,
  lDongRegnCd?: number,
  lDongSignguCd?: number
): Promise<TouristSpot[]> {
  const params: Record<string, any> = {
    numOfRows: '2000',
    pageNo: '1',
    arrange: 'B',
    contentTypeId: contentsType.toString(),
    lDongRegnCd: lDongRegnCd?.toString(),
    lDongSignguCd: lDongSignguCd?.toString(),
  };
  const data = await apiClient('areaBasedList2', params);
  const items = data.response?.body?.items?.item ?? [];
  return items.map((item: any) => ({
    id: item.contentid,
    name: item.title,
    description: item.addr1 || '설명 없음',
    imageUrl: item.firstimage || '',
    location: item.addr1 || '위치 정보 없음',
    contentTypeId: item.contenttypeid?.toString() || '',
    lclsSystm1: item.lclsSystm1,
    lclsSystm2: item.lclsSystm2,
    lclsSystm3: item.lclsSystm3,
  }));
}
export async function FetchLDongRegions() {
  const data = await apiClient('ldongCode2', { 
    numOfRows: '50',
    lDongListYn: 'N' 
  });
  const items = data.response?.body?.items?.item ?? [];
  return items.map((item: any) => ({
    id: item.rnum,
    regionCode: item.code,
    regionName: item.name,
  }));
}

export async function FetchLDongSigungus(regionCode:number) {
  const data = await apiClient('ldongCode2', { 
    numOfRows: '100',
    lDongListYn: 'N', 
    lDongRegnCd: regionCode.toString() 
  });
  const items = data.response?.body?.items?.item ?? [];
  return items.map((item: any) => ({
    id: item.rnum,
    sigunguCode: item.code,
    sigunguName: item.name,
  }));
}

export async function FetchDetailCommonInfo(contentId: string) {
  const data = await apiClient('detailCommon2', {
    contentId,
  });
  return data.response?.body?.items?.item?.[0] || null;
}

export async function FetchIntroInfo(contentId: string, contentTypeId: string) {
  const data = await apiClient('detailIntro2', { contentId, contentTypeId });
  return data.response?.body?.items?.item?.[0] || null;
}

export async function FetchRepeatInfo(contentId: string, contentTypeId: string) {
  const data = await apiClient('detailInfo2', { contentId, contentTypeId });
  return data.response?.body?.items?.item ?? [];
}

export async function FetchEvents(
  eventStartDate: string,
  eventEndDate?: string,
  lDongRegnCd?: number,
  lDongSignguCd?: number
): Promise<TouristSpot[]> {
  const params: Record<string, any> = {
    numOfRows: '1000',
    pageNo: '1',
    arrange: 'A', 
    eventStartDate,
    eventEndDate,
    lDongRegnCd: lDongRegnCd?.toString(),
    lDongSignguCd: lDongSignguCd?.toString(),
  };
  const data = await apiClient('searchFestival2', params);
  const items = data.response?.body?.items?.item ?? [];
  return items.map((item: any) => ({
    id: item.contentid,
    name: item.title,
    description: item.addr1 || '설명 없음',
    imageUrl: item.firstimage || '',
    location: item.addr1 || '위치 정보 없음',
    contentTypeId: item.contenttypeid?.toString() || '15', 
    eventStartDate: item.eventstartdate, 
    lclsSystm1: item.lclsSystm1,
    lclsSystm2: item.lclsSystm2,
    lclsSystm3: item.lclsSystm3,
  }));
}

export async function FetchPopularInArea(
  areaCode: string,
  sigunguCode: string,
  contentTypeId: string
): Promise<TouristSpot[]> {
  const params = {
    numOfRows: '6',
    pageNo: '1',
    arrange: 'B',
    areaCode: areaCode,
    sigunguCode: sigunguCode,
    contentTypeId: contentTypeId,
  };
  const data = await apiClient('areaBasedList2', params);
  const items = data.response?.body?.items?.item ?? [];
  return items.map((item: any) => ({
    id: item.contentid,
    name: item.title,
    description: item.addr1 || '설명 없음',
    imageUrl: item.firstimage || '',
    location: item.addr1 || '위치 정보 없음',
    contentTypeId: item.contenttypeid?.toString() || '',
    lclsSystm1: item.lclsSystm1,
    lclsSystm2: item.lclsSystm2,
    lclsSystm3: item.lclsSystm3,
  }));
}

export async function FetchNearbySpots(
  mapx: string,
  mapy: string,
  contentTypeId: string
): Promise<TouristSpot[]> {
  const params = {
    numOfRows: '6',
    pageNo: '1',
    arrange: 'E',
    mapX: mapx,
    mapY: mapy,
    radius: '10000',
    contentTypeId: contentTypeId,
  };
  const data = await apiClient('locationBasedList2', params);
  const items = data.response?.body?.items?.item ?? [];
  return items.map((item: any) => ({
    id: item.contentid,
    name: item.title,
    description: item.addr1 || '설명 없음',
    imageUrl: item.firstimage || '',
    location: item.addr1 || '위치 정보 없음',
    contentTypeId: item.contenttypeid?.toString() || '',
    lclsSystm1: item.lclsSystm1,
    lclsSystm2: item.lclsSystm2,
    lclsSystm3: item.lclsSystm3,
  }));
}

export async function FetchSimilarByCategory(
  areaCode: string,
  sigunguCode: string,
  cat1: string,
  cat2: string,
  cat3: string,
  contentTypeId: string
): Promise<TouristSpot[]> {
  const params: Record<string, any> = {
    numOfRows: '6',
    pageNo: '1',
    arrange: 'B',
    areaCode,
    sigunguCode,
    lclsSystm1: cat1, 
    lclsSystm2: cat2,
    lclsSystm3: cat3,
    contentTypeId,
  };
  const validParams = Object.fromEntries(Object.entries(params).filter(([_, v]) => v != null));
  const data = await apiClient('areaBasedList2', validParams);
  const items = data.response?.body?.items?.item ?? [];
  return items.map((item: any) => ({
    id: item.contentid,
    name: item.title,
    description: item.addr1 || '설명 없음',
    imageUrl: item.firstimage || '',
    location: item.addr1 || '위치 정보 없음',
    contentTypeId: item.contenttypeid?.toString() || '',
    lclsSystm1: item.lclsSystm1,
    lclsSystm2: item.lclsSystm2,
    lclsSystm3: item.lclsSystm3,
  }));
}