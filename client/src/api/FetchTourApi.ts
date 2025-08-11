// /src/api/FetchTourApi.ts

const TOURAPI_KEY = process.env.REACT_APP_TOURAPI_KEY;
const decodedKey = decodeURIComponent(TOURAPI_KEY || "");

// API 요청을 위한 기본 클라이언트 함수
async function apiClient(operation: string, additionalParams: Record<string, string> = {}) {
  const baseUrl = 'https://apis.data.go.kr/B551011/KorService2/';
  const url = new URL(baseUrl + operation);
  
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
        throw new Error(`API 요청 실패: ${res.status} ${res.statusText}`);
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
  }));
}