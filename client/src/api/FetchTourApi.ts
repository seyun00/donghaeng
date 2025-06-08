const TOURAPI_KEY = process.env.REACT_APP_TOURAPI_KEY;
const decodedKey = decodeURIComponent(TOURAPI_KEY || "");

export interface TouristSpot {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  location: string;
  contentTypeId: string; 
}

// 지역 기반 관광정보 조회
export async function FetchTourSpots(areaCode: number, contentsType: number): Promise<TouristSpot[]> {
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
    contentTypeId: item.contenttypeid?.toString() || '', 
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
//위치 기반 정보 조회
export async function FetchNearbyTourSpots(mapX: number, mapY: number, radius = 1000): Promise<TouristSpot[]> {
  const url = new URL('https://apis.data.go.kr/B551011/KorService1/locationBasedList1');

  // 요청 파라미터 설정
  const params = {
    serviceKey: decodedKey,          // 인증 키
    MobileOS: 'ETC',                 // 운영체제 (필수)
    MobileApp: 'TourApp',            // 앱 이름 (필수)
    _type: 'json',                   // 응답 형식
    numOfRows: '10',                 // 결과 수
    pageNo: '1',                     // 페이지 번호
    listYN: 'Y',                     // 목록 여부
    arrange: 'E',                    // 거리순 정렬
    mapX: mapX.toString(),           // 현재 위치의 경도
    mapY: mapY.toString(),           // 현재 위치의 위도
    radius: radius.toString(),       // 반경(m)
  };

  Object.entries(params).forEach(([key, value]) => url.searchParams.append(key, value));

  // API 요청
  const res = await fetch(url.toString());
  const data = await res.json();

  const items = data.response?.body?.items?.item ?? [];

  // TouristSpot 형식으로 변환
  return items.map((item: any) => ({
    id: item.contentid,
    name: item.title,
    description: item.addr1 || '설명 없음',
    imageUrl: item.firstimage || '',
    location: item.addr1 || '위치 정보 없음',
  }));
}
// 키워드 검색 조회
export async function FetchKeyword(keyword: string): Promise<TouristSpot[]> {
  const url = new URL('https://apis.data.go.kr/B551011/KorService1/searchKeyword1');

  const params = {
    serviceKey: decodedKey,
    MobileOS: 'ETC',
    MobileApp: 'TourApp',
    _type: 'json',
    numOfRows: '10',
    pageNo: '1',
    listYN: 'Y',
    arrange: 'B',                   
    keyword: encodeURIComponent(keyword),
  };

  Object.entries(params).forEach(([key, value]) => url.searchParams.append(key, value));

  const res = await fetch(url.toString());
  const data = await res.json();
  const items = data.response?.body?.items?.item ?? [];

  return items.map((item: any) => ({
    id: item.contentid,
    name: item.title,
    description: item.addr1 || '설명 없음',
    imageUrl: item.firstimage || '',
    location: item.addr1 || '위치 정보 없음',
  }));
}
//공통정보조회
export async function FetchDetailCommonInfo(contentId: string, contentTypeId: string) {
  const url = new URL('https://apis.data.go.kr/B551011/KorService1/detailCommon1');

  const params = {
    serviceKey: decodedKey,
    MobileOS: 'ETC',
    MobileApp: 'TourApp',
    _type: 'json',
    contentId,                  // 콘텐츠 ID
    contentTypeId,              // 콘텐츠 타입 ID
    defaultYN: 'Y',             // 기본 정보 포함
    firstImageYN: 'Y',          // 이미지 포함 여부
    overviewYN: 'Y',            // 개요 포함 여부
  };

  Object.entries(params).forEach(([key, value]) => url.searchParams.append(key, value));

  const res = await fetch(url.toString());
  const data = await res.json();

  return data.response?.body?.items?.item; // 상세 정보 원본 반환
}
// 콘텐츠의 소개 정보 (숙박의 경우 체크인/체크아웃 등) 조회
export async function FetchIntroInfo(contentId: string, contentTypeId: string) {
  const url = new URL('https://apis.data.go.kr/B551011/KorService1/detailIntro1');
  const params = {
    serviceKey: decodedKey,   // 디코딩된 인증키
    MobileOS: 'ETC',
    MobileApp: 'TourApp',
    _type: 'json',
    contentId,
    contentTypeId,
  };

  Object.entries(params).forEach(([key, value]) => url.searchParams.append(key, value));

  const res = await fetch(url.toString());

  if (!res.ok) {
    throw new Error(`소개정보 요청 실패: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  return data.response?.body?.items?.item ?? null;
}
// 콘텐츠의 반복 정보 (숙박: 객실, 공연: 회차 등) 조회
export async function FetchRepeatInfo(contentId: string, contentTypeId: string) {
  const url = new URL('https://apis.data.go.kr/B551011/KorService1/detailInfo1');
  const params = {
    serviceKey: decodedKey,
    MobileOS: 'ETC',
    MobileApp: 'TourApp',
    _type: 'json',
    contentId,
    contentTypeId,
  };

  Object.entries(params).forEach(([key, value]) => url.searchParams.append(key, value));

  const res = await fetch(url.toString());

  if (!res.ok) {
    throw new Error(`반복정보 요청 실패: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  return data.response?.body?.items?.item ?? [];
}
