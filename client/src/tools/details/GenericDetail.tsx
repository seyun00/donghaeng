import React from 'react';
import { detailLabels, specialFields } from './labelMap';

interface GenericDetailProps {
  intro: { [key: string]: any };
  title: string;
}

const GenericDetail: React.FC<GenericDetailProps> = ({ intro, title }) => {
  if (!intro || Object.keys(intro).length === 0) {
    return null;
  }

  const displayableItems = Object.entries(intro).filter(([key, value]) => {
    return detailLabels[key] && value && String(value).trim() !== '';
  });

  if (displayableItems.length === 0) {
    return (
      <div>
        <h3 className="text-xl font-semibold mt-6">{title}</h3>
        <p className="mt-2 text-sm text-gray-500">이 항목에 대한 추가 세부 정보가 없습니다.</p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-xl font-semibold mt-6">{title}</h3>
      <ul className="mt-2 text-sm text-gray-700 space-y-2">
        {displayableItems.map(([key, value]) => (
          <li key={key} className="flex border-b pb-1">
            <strong className="w-1/3 text-gray-600">{detailLabels[key]}</strong>
            <span className="w-2/3">
              {specialFields[key] ? specialFields[key](value) : value}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default GenericDetail;