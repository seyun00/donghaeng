const TOURAPI_KEY = process.env.REACT_APP_TOURAPI_KEY;
const decodedKey = decodeURIComponent(TOURAPI_KEY || "");
export interface TouristSpot {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  location: string;
}

// 지역 기반 관광정보 조회
export async function fetchTourSpots(areaCode: number, contentsType: number): Promise<TouristSpot[]> {
  const url = new URL('https://apis.data.go.kr/B551011/KorService1/areaBasedList1');
  const params = {
    serviceKey: decodedKey,
    MobileOS: 'ETC',
    MobileApp: 'TourApp',
    _type: 'json',
    numOfRows: '10',
    pageNo: '1',
    arrange: 'B',
    contentTypeId: contentsType.toString(),
    areaCode: areaCode.toString(),
  };

  Object.entries(params).forEach(([key, value]) => url.searchParams.append(key, value));

  console.log(url)

  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error(`API 요청 실패: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  console.log(data)

  const items = data.response?.body?.items?.item ?? [];
  return items.map((item: any) => ({
    id: item.contentid,
    name: item.title,
    description: item.addr1 || '설명 없음',
    imageUrl: item.firstimage || '',
    location: item.addr1 || '위치 정보 없음',
  }));
}

// 지역 코드 정보 조회
export async function FetchAreaCode() {
  const url = new URL('https://apis.data.go.kr/B551011/KorService1/areaCode1');
  const params = {
    serviceKey: decodedKey,
    MobileOS: 'ETC',
    MobileApp: 'TourApp',
    _type: 'json',
    numOfRows: '20',
    pageNo: '1',
  };

  Object.entries(params).forEach(([key, value]) => url.searchParams.append(key, value));

  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error(`API 요청 실패: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  const items = data.response?.body?.items?.item ?? [];

  return items.map((item: any) => ({
    id: item.rnum,
    areaCode: item.code,
    areaName: item.name,
  }));
}
