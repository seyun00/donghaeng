import React, { useState, useEffect, FormEvent } from 'react';
import supabase from '../api/supabaseClient';

interface BudgetItem {
  id: number;
  description: string;
  cost: number;
}

export default function BudgetList({ date, planId, onBudgetAdded }: {
  date: number;
  planId: string | undefined;
  onBudgetAdded?: () => void;
}) {
  const [budgets, setBudgets] = useState<BudgetItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [desc, setDesc] = useState('');
  const [cost, setCost] = useState('');

  // 리스트 불러오기
  const fetchBudgets = async () => {
    if (!planId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('budgets')
      .select('*')
      .eq('plan_id', planId)
      .eq('visit_day', date)
      .order('created_at', { ascending: false });
    if (!error && data) setBudgets(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchBudgets();
  }, [planId, date]);

  // 폼 제출
  const handleAddBudget = async (e: FormEvent) => {
    e.preventDefault();
    if (!desc) {
      alert("설명을 입력하세요.");
      return;
    }
    else if (!cost) {
      alert("비용을 입력하세요.");
      return;
    }
    else if (isNaN(Number(cost))) {
      alert("비용란에는 숫자만 입력하세요.");
      return;
    }
    
    if (!planId) {
      return;
    }
    const { error } = await supabase.from('budgets').insert([
      {
        plan_id: planId,
        visit_day: date,
        description: desc,
        cost: Number(cost),
      },
    ]);
    if (error) {
      alert('예산 추가 실패: ' + error.message);
    } else {
      setDesc('');
      setCost('');
      fetchBudgets();
      if (onBudgetAdded) onBudgetAdded();
    }
  };

  return (
    <div className='bg-gray-200 rounded-[5px] px-2 pb-1 shadow-[1px_1px_5px_1px_rgba(0,0,0,0.2)] mx-1'>
      <h4 className='py-2 text-sm text-center'>{date}일차 예산</h4>
      <form className='flex mb-[10px] justify-between' onSubmit={handleAddBudget}>
        <input
          type="text"
          placeholder="설명"
          className='focus:outline-none rounded-[5px] w-[180px] text-sm'
          value={desc}
          onChange={e => setDesc(e.target.value)}
        />
        <input
          type="text"
          placeholder="비용(원)"
          className='w-[70px] focus:outline-none rounded-[5px] text-sm'
          value={cost}
          onChange={e => setCost(e.target.value)}
        />
        <div className='flex items-center'>
          <button type="submit" className='pb-1 text-2xl'>+</button>
        </div>
      </form>
      {!loading &&
        (<ul className='p-0 m-0'>
          {budgets.length === 0 && <li className="text-xs">예산 항목이 없습니다.</li>}
          {budgets.map(item => (
            <li key={item.id} className='list-none mb-[5px] flex justify-between'>
              <div>{item.description}</div>
              <div>{item.cost.toLocaleString()}원</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
