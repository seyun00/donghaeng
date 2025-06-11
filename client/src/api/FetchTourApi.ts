const TOURAPI_KEY = process.env.REACT_APP_TOURAPI_KEY;
const decodedKey = decodeURIComponent(TOURAPI_KEY || "");

// API 요청을 위한 기본 클라이언트 함수
async function apiClient(operation: string, additionalParams: Record<string, string> = {}) {
  const baseUrl = 'https://apis.data.go.kr/B551011/KorService1/';
  const url = new URL(baseUrl + operation);
  
  const baseParams = {
    serviceKey: decodedKey,
    MobileOS: 'ETC',
    MobileApp: 'TourApp', // 실제 서비스명으로 변경하는 것을 권장합니다.
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

// --- 기존 Fetch 함수들을 apiClient를 사용하도록 리팩토링 ---

export interface TouristSpot {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  location: string;
  contentTypeId: string; 
}

export async function FetchTourSpots(areaCode: number, contentsType: number, sigunguCode?: number): Promise<TouristSpot[]> {
  const params: Record<string, string> = {
    numOfRows: '10',
    pageNo: '1',
    arrange: 'B',
    contentTypeId: contentsType.toString(),
    areaCode: areaCode.toString(),
  };

  // 시군구 코드가 있으면 추가
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
  const data = await apiClient('areaCode1', {
    numOfRows: '20', 
    pageNo: '1' 
  });
  const items = data.response?.body?.items?.item ?? [];
  return items.map((item: any) => ({
    id: item.rnum,
    areaCode: item.code,
    areaName: item.name,
  }));
}

export async function FetchSigunguCode(areaCode:number) {
  const data = await apiClient('areaCode1', { 
    numOfRows: '50', 
    pageNo: '1', 
    areaCode: areaCode.toString() 
  });
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
  // detailCommon1은 item이 단일 객체로 오는 경우가 많으므로 첫 번째 요소를 반환
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