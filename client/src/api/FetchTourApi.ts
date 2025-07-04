// api/FetchTourApi.ts

const TOURAPI_KEY = process.env.REACT_APP_TOURAPI_KEY;
const decodedKey = decodeURIComponent(TOURAPI_KEY || "");

// API 요청을 위한 기본 클라이언트 함수
async function apiClient(operation: string, additionalParams: Record<string, string> = {}) {
  const baseUrl = 'https://apis.data.go.kr/B551011/KorService1/';
  const url = new URL(baseUrl + operation);
  
  const baseParams = {
    serviceKey: decodedKey,
    MobileOS: 'ETC',
    MobileApp: 'TourApp',
    _type: 'json',
  };

  const params = { ...baseParams, ...additionalParams };
  Object.entries(params).forEach(([key, value]) => url.searchParams.append(key, value));

  try {
    const res = await fetch(url.toString());
    if (!res.ok) {
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
  eventStartDate?: string; // 행사 시작일 필드
}

export async function FetchTourSpots(areaCode: number, contentsType: number, sigunguCode?: number): Promise<TouristSpot[]> {
  const params: Record<string, string> = {
    numOfRows: '10000',
    pageNo: '1',
    arrange: 'B',
    contentTypeId: contentsType.toString(),
    areaCode: areaCode.toString(),
  };

  if (sigunguCode) {
    params.sigunguCode = sigunguCode.toString();
  }
  const data = await apiClient('areaBasedList1', params);
  
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

export async function FetchAreaCode() {
  const data = await apiClient('areaCode1', { numOfRows: '20', pageNo: '1' });
  const items = data.response?.body?.items?.item ?? [];
  return items.map((item: any) => ({
    id: item.rnum,
    areaCode: item.code,
    areaName: item.name,
  }));
}

export async function FetchSigunguCode(areaCode:number) {
  const data = await apiClient('areaCode1', { numOfRows: '50', pageNo: '1', areaCode: areaCode.toString() });
  const items = data.response?.body?.items?.item ?? [];
  return items.map((item: any) => ({
    id: item.rnum,
    sigunguCode: item.code,
    sigunguName: item.name,
  }));
}

export async function FetchDetailCommonInfo(contentId: string, contentTypeId: string) {
  const data = await apiClient('detailCommon1', {
    contentId,
    contentTypeId,
    defaultYN: 'Y',
    firstImageYN: 'Y',
    overviewYN: 'Y',
  });
  return data.response?.body?.items?.item?.[0] || data.response?.body?.items?.item || null;
}

export async function FetchIntroInfo(contentId: string, contentTypeId: string) {
  const data = await apiClient('detailIntro1', { contentId, contentTypeId });
  return data.response?.body?.items?.item?.[0] || data.response?.body?.items?.item || null;
}

export async function FetchRepeatInfo(contentId: string, contentTypeId: string) {
  const data = await apiClient('detailInfo1', { contentId, contentTypeId });
  return data.response?.body?.items?.item ?? [];
}

// --- 아래 행사 정보 조회 함수 추가 ---
export async function FetchEvents(eventStartDate: string, areaCode?: number, sigunguCode?: number): Promise<TouristSpot[]> {
  const params: Record<string, string> = {
    numOfRows: '10000',
    pageNo: '1',
    arrange: 'A',
    listYN: 'Y',
    eventStartDate,
  };

  if (areaCode) {
    params.areaCode = areaCode.toString();
  }
  if (sigunguCode) {
    params.sigunguCode = sigunguCode.toString();
  }

  const data = await apiClient('searchFestival1', params);
  const items = data.response?.body?.items?.item ?? [];
  
  return items.map((item: any) => ({
    id: item.contentid,
    name: item.title,
    description: item.addr1 || '설명 없음',
    imageUrl: item.firstimage || '',
    location: item.addr1 || '위치 정보 없음',
    contentTypeId: item.contenttypeid?.toString() || '15', 
    eventStartDate: item.eventstartdate, // 응답받은 행사 시작일 데이터를 매핑
  }));
}