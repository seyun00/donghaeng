// tools/details/labelMap.ts

// 각 콘텐츠 타입별 API 필드 이름과 한글 레이블을 매핑합니다.
// 출처: TourAPI활용매뉴얼 v4.2 [소개정보조회] 응답메시지 명세
export const detailLabels: { [key: string]: string } = {
  // 관광지 (contentTypeId=12)
  accomcount: "수용인원",
  chkbabycarriage: "유모차 대여 정보",
  chkcreditcard: "신용카드 가능 정보",
  chkpet: "애완동물 동반가능 정보",
  expagerange: "체험 가능 연령",
  expguide: "체험 안내",
  infocenter: "문의 및 안내",
  opendate: "개장일",
  parking: "주차 ",
  restdate: "쉬는 날",
  useseason: "이용 시기",
  usetime: "이용 시간",

  // 문화시설 (contentTypeId=14)
  accomcountculture: "수용인원 ",
  chkbabycarriageculture: "유모차 대여 정보 ",
  chkcreditcardculture: "신용카드 가능 정보 ",
  chkpetculture: "애완동물 동반가능 정보 ",
  discountinfo: "할인 정보 ",
  infocenterculture: "문의 및 안내 ",
  parkingculture: "주차 시설 ",
  parkingfee: "주차 요금 ",
  restdateculture: "쉬는 날 ",
  usefee: "이용 요금 ",
  usetimeculture: "이용 시간 ",
  scale: "규모 ",
  spendtime: "관람 소요시간 ",

  // 행사/공연/축제 (contentTypeId=15)
  agelimit: "관람 가능 연령",
  bookingplace: "예매처",
  discountinfofestival: "할인 정보",
  eventenddate: "행사 종료일",
  eventhomepage: "행사 홈페이지",
  eventplace: "행사 장소",
  eventstartdate: "행사 시작일",
  festivalgrade: "축제 등급",
  placeinfo: "행사장 위치 안내",
  playtime: "공연 시간",
  program: "행사 프로그램",
  spendtimefestival: "관람 소요시간",
  sponsor1: "주최자 정보",
  sponsor1tel: "주최자 연락처",
  sponsor2: "주관사 정보",
  sponsor2tel: "주관사 연락처",
  subevent: "부대 행사",
  usetimefestival: "이용 요금",

  // 여행코스 (contentTypeId=25)
  distance: "코스 총 거리",
  infocentertourcourse: "문의 및 안내",
  schedule: "코스 일정",
  taketime: "코스 총 소요시간",
  theme: "코스 테마",

  // 레포츠 (contentTypeId=28)
  accomcountleports: "수용인원",
  chkbabycarriageleports: "유모차 대여 정보",
  chkcreditcardleports: "신용카드 가능 정보",
  chkpetleports: "애완동물 동반가능 정보",
  expagerangeleports: "체험 가능 연령",
  infocenterleports: "문의 및 안내",
  openperiod: "개장 기간",
  parkingfeeleports: "주차 요금",
  parkingleports: "주차 시설",
  reservation: "예약 안내",
  restdateleports: "쉬는 날",
  scaleleports: "규모",
  usefeeleports: "입장료",
  usetimeleports: "이용 시간",

  // 숙박 (contentTypeId=32)
  accomcountlodging: "수용 가능인원",
  benikia: "베니키아 여부",
  checkintime: "체크인 시간",
  checkouttime: "체크아웃 시간",
  chkcooking: "객실 내 취사 여부",
  foodplace: "식음료장",
  goodstay: "굿스테이 여부",
  hanok: "한옥 여부",
  infocenterlodging: "문의 및 안내",
  parkinglodging: "주차 시설",
  pickup: "픽업 서비스",
  roomcount: "객실 수",
  reservationlodging: "예약 안내",
  reservationurl: "예약 안내 홈페이지",
  roomtype: "객실 유형",
  scalelodging: "규모",
  subfacility: "부대시설",
  refundregulation: "환불 규정",

  // 쇼핑 (contentTypeId=38)
  chkbabycarriageshopping: "유모차 대여 정보",
  chkpetshopping: "애완동물 동반가능 정보",
  culturecenter: "문화센터 바로가기",
  fairday: "장서는 날",
  infocentershopping: "문의 및 안내",
  opendateshopping: "개장일",
  opentime: "영업 시간",
  parkingshopping: "주차 시설",
  restdateshopping: "쉬는 날",
  restroom: "화장실 ",
  saleitem: "판매 품목",
  saleitemcost: "판매 품목별 가격",
  scaleshopping: "규모",
  shopguide: "매장 안내",

  // 음식점 (contentTypeId=39)
  chkcreditcardfood: "신용카드 가능 정보",
  discountinfofood: "할인 정보",
  firstmenu: "대표 메뉴",
  infocenterfood: "문의 및 안내",
  kidsfacility: "어린이 놀이방 여부",
  opendatefood: "개업일",
  opentimefood: "영업 시간",
  packing: "포장 가능",
  parkingfood: "주차 시설",
  reservationfood: "예약 안내",
  restdatefood: "쉬는 날",
  scalefood: "규모",
  seat: "좌석 수",
  smoking: "금연/흡연 여부",
  treatmenu: "취급 메뉴",
  lcnsno: "인허가번호",
};

// 특별한 포맷팅이 필요한 필드를 관리합니다.
export const specialFields: { [key: string]: (value: any) => string | React.ReactNode } = {
  // 날짜 포맷팅
  eventstartdate: (value) => formatDate(value),
  eventenddate: (value) => formatDate(value),
  opendate: (value) => formatDate(value),
  opendatefood: (value) => formatDate(value),
  opendateshopping: (value) => formatDate(value),
};

const formatDate = (dateStr: string) => {
  if (!dateStr || dateStr.length !== 8) return dateStr;
  return `${dateStr.substring(0, 4)}.${dateStr.substring(4, 6)}.${dateStr.substring(6, 8)}`;
};