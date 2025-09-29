import React, { useState } from 'react';
import supabase from '../api/supabaseClient';
import { Link } from 'react-router-dom';

interface Plan {
  id: number;
  creator_id: string;
  plan_name: string;
  start_date: string;
  end_date: string;
  shared: boolean;
  creator?: {
    id: string;
    nickname: string;
    profile_url?: string;
  };
}

function getDuration(start: string, end: string): number {
  const s = new Date(start);
  const e = new Date(end);
  return Math.max(1, Math.round((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1);
}

const PlanCard = ({ plan }: { plan: Plan }) => (
  <Link to={`/shared/${plan.id}`} className="block group">
    <div className="flex flex-col justify-between p-4 transition-shadow bg-white border rounded-lg shadow-md h-52 hover:shadow-lg">
      <div>
        <h3 className="text-lg font-bold truncate">{plan.plan_name}</h3>
        <p className="mt-1 text-sm text-gray-500">
          여행 기간: {getDuration(plan.start_date, plan.end_date)}일
        </p>
        <div className="flex items-center mt-3">
          <img
            src={plan.creator?.profile_url || 'https://via.placeholder.com/32.png?text=No+Image'}
            alt={plan.creator?.nickname || '프로필 사진'}
            className="object-cover w-6 h-6 rounded-full"
          />
          <div className="ml-2 text-xs text-gray-700">{plan.creator?.nickname || '익명'}</div>
        </div>
      </div>
      <button className="w-full py-2 mt-4 text-sm font-semibold text-white transition-colors bg-blue-500 rounded-md group-hover:bg-blue-600">
        일정 구경하기
      </button>
    </div>
  </Link>
);

export default function SearchSharedPlan() {
  const [keyword, setKeyword] = useState('');
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSearched(true);
    const { data, error } = await supabase
      .from('plans')
      .select(`
        *,
        creator:userinfo (
          id,
          nickname,
          profile_url
        )
      `)
      .ilike('plan_name', `%${keyword}%`)
      .eq('shared', true);
    if (!error && data) setPlans(data);
    setLoading(false);
  };

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8 text-center">
          <h2 className="mb-2 text-2xl font-bold text-gray-700">공유된 여행 일정 검색</h2>
          <p className="text-lg text-gray-600">다른 사람들의 일정을 찾아보고 마음에 드는 일정을 구경해 보세요.</p>
        </div>
        <div className="relative flex justify-center mb-2">
          <form className="flex justify-center gap-3 mb-8 " onSubmit={handleSearch}>
            <input
              type="text"
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md w-72 focus:outline-none focus:ring focus:ring-blue-300"
              placeholder="일정 이름 검색"
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
            />
            <button
              type="submit"
              className="flex items-center justify-center w-12 h-10 transition bg-blue-500 rounded-lg hover:bg-blue-600"
              aria-label="검색"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="white"
                strokeWidth={2}
              >
                <circle cx="11" cy="11" r="7" stroke="white" strokeWidth="2" />
                <line x1="16.5" y1="16.5" x2="21" y2="21" stroke="white" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
            <Link to={`/placeInformation?typeId=25`} className='absolute top-0 right-0'>
              <button className="px-4 py-2 text-sm font-semibold text-white transition bg-indigo-500 rounded-md shadow hover:bg-indigo-600">
                추천 코스 바로가기
              </button>
            </Link>
          </form>
        </div>

        {loading && <p className="py-6 font-medium text-center text-blue-500">검색중...</p>}

        {searched && !loading && (
          <div>
            {plans.length === 0 ? (
              <div className="py-10 text-center bg-white rounded-lg shadow-sm">
                <p className="text-gray-500">검색 결과가 없습니다.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 mt-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {plans.map(plan => (
                  <PlanCard key={plan.id} plan={plan} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
