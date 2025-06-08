import React from 'react';

// 행사 소개 정보 타입
interface IntroInfo {
  sponsor1?: string;
  sponsor1tel?: string;
  eventstartdate?: string;
  eventenddate?: string;
  playtime?: string;
  usetimefestival?: string;
  eventplace?: string;
}

interface EventDetailProps {
  intro?: IntroInfo;
}

const EventDetail: React.FC<EventDetailProps> = ({ intro }) => {
  if (!intro) return null;

  // 날짜 포맷팅 함수 (YYYY.MM.DD)
  const formatDate = (dateStr: string) => {
    if (!dateStr || dateStr.length !== 8) return dateStr;
    return `${dateStr.substring(0, 4)}.${dateStr.substring(4, 6)}.${dateStr.substring(6, 8)}`;
  };

  return (
    <div>
      <h3 className="text-xl font-semibold mt-6">행사 정보</h3>
      <ul className="mt-2 text-sm text-gray-700 space-y-1">
        {intro.eventstartdate && <li>행사 기간: {formatDate(intro.eventstartdate)} ~ {formatDate(intro.eventenddate || '')}</li>}
        {intro.playtime && <li>공연 시간: {intro.playtime}</li>}
        {intro.eventplace && <li>행사 장소: {intro.eventplace}</li>}
        {intro.usetimefestival && <li dangerouslySetInnerHTML={{ __html: `이용 요금: ${intro.usetimefestival}`}} />}
        {intro.sponsor1 && <li>주최: {intro.sponsor1} ({intro.sponsor1tel})</li>}
      </ul>
    </div>
  );
};

export default EventDetail;