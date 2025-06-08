import React from 'react';

// 특별히 처리할 필드가 없는 경우, intro 객체를 문자열로 간단히 표시
const DefaultDetail: React.FC<{ intro: any }> = ({ intro }) => {
  if (!intro) return null;

  return (
    <div>
      <h3 className="text-xl font-semibold mt-6">추가 정보</h3>
      <p className="mt-2 text-sm text-gray-700">
        이 콘텐츠 타입에 대한 특화된 정보는 없지만, 제공된 추가 정보는 다음과 같습니다.
      </p>
      <pre className="mt-2 p-2 bg-gray-100 rounded text-xs">
        {JSON.stringify(intro, null, 2)}
      </pre>
    </div>
  );
};

export default DefaultDetail;