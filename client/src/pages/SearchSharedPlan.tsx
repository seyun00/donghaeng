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
}

function getDuration(start: string, end: string): number {
  const s = new Date(start);
  const e = new Date(end);
  return Math.max(1, Math.round((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1);
}

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
      .select('*')
      .ilike('plan_name', `%${keyword}%`)
      .eq('shared', true);
    if (!error && data) setPlans(data);
    setLoading(false);
  };

  return (
    <div className="min-h-screen py-10 bg-gradient-to-b from-gray-100 to-gray-50">
      <div className="max-w-4xl mx-auto bg-white shadow-[0_4px_16px_rgba(0,0,0,0.08)] rounded-2xl p-8">
        <h2 className="mb-2 text-2xl font-bold text-center text-gray-700">공유된 여행 계획을 구경하세요</h2>
        <h3 className='mb-8 text-lg font-bold text-center text-gray-400'> 다른 사람들의 일정을 찾아볼 수 있어요</h3>
        <form className="flex justify-center gap-3 mb-8" onSubmit={handleSearch}>
          <input 
            type="text" 
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md w-72 focus:outline-none focus:ring focus:ring-blue-300"
            placeholder="일정 이름 검색"
            value={keyword}
            onChange={e => setKeyword(e.target.value)}
          />
          <button 
            type="submit" 
            className="px-5 py-2 font-semibold text-white transition-all bg-blue-500 rounded-md hover:bg-blue-600"
          >
            검색
          </button>
        </form>
        {loading && <p className="py-6 font-medium text-center text-blue-500">검색중...</p>}
        {searched && !loading && (
          <div>
            {plans.length === 0 ? (
              <p className="py-6 text-center text-gray-400">검색 결과가 없습니다.</p>
            ) : (
              <div className="flex flex-wrap justify-start gap-8 mt-4">
                {plans.map(plan => (
                  <Link to={`/shared/${plan.id}`}>
                    <div key={plan.id}
                      className="flex flex-col items-center w-64 px-6 transition-shadow bg-white border border-gray-100 shadow-md rounded-xl py-7 hover:shadow-lg"
                    >
                      <div className="mb-6 text-xl font-bold text-center">{plan.plan_name}</div>
                      <div className="mb-2 text-sm text-gray-500">여행 기간</div>
                      <div className="mb-2 text-2xl font-bold text-gray-800">
                        {getDuration(plan.start_date, plan.end_date)}일
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
