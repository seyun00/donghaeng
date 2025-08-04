import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import supabase from '../api/supabaseClient';

// 여행 계획 카드 컴포넌트
const PlanCard = ({ plan }: { plan: any }) => {
  return (
    <div style={{
      border: '1px solid #ccc',
      borderRadius: '8px',
      padding: '16px',
      width: '200px',
      height: '200px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between'
    }}>
      <div>
        <h3 style={{ margin: 0, fontSize: '1.2em' }}>{plan.plan_name}</h3>
        <p style={{ fontSize: '0.9em', color: '#666', margin: '8px 0' }}>
          {plan.start_date} ~ {plan.end_date}
        </p>
        <p style={{ fontSize: '0.9em', color: '#666' }}>참가자: ...</p>
      </div>
      <Link to={`/planning/${plan.id}`}>
        <button style={{ width: '100%', padding: '8px' }}>계획 보기</button>
      </Link>
    </div>
  );
};

// 새로운 여행 계획 생성 모달 컴포넌트
const CreatePlanModal = ({
  isOpen,
  onClose,
  onCreate
}: {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string, startDate: string, endDate: string) => void;
}) => {
  const nameRef = useRef<HTMLInputElement>(null);
  const startRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleSubmit = () => {
    const name = nameRef.current?.value;
    const startDate = startRef.current?.value;
    const endDate = endRef.current?.value;
    if (name && startDate && endDate) {
      onCreate(name, startDate, endDate);
    } else {
      alert("모든 필드를 입력해주세요.");
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
      alignItems: 'center', justifyContent: 'center'
    }}>
      <div style={{ background: 'white', padding: '20px', borderRadius: '8px' }}>
        <h2>새로운 여행 계획하기</h2>
        <input ref={nameRef} type="text" placeholder="여행 이름" style={{ display: 'block', marginBottom: '10px', width: '250px', padding: '8px' }} />
        <input ref={startRef} type="date" placeholder="시작일" style={{ display: 'block', marginBottom: '10px', width: '250px', padding: '8px' }} />
        <input ref={endRef} type="date" placeholder="종료일" style={{ display: 'block', marginBottom: '10px', width: '250px', padding: '8px' }} />
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button onClick={onClose}>취소</button>
          <button onClick={handleSubmit}>생성</button>
        </div>
      </div>
    </div>
  );
};

// 일정 관리 페이지 메인 컴포넌트
export default function PlanManagement() {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserPlans = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        alert("로그인이 필요합니다.");
        navigate('/signin');
        return;
      }

      const { data: memberData, error: memberError } = await supabase
        .from('plan_members')
        .select('plan_id')
        .eq('user_id', user.id);

      if (memberError) {
        console.error("멤버 정보 조회 실패:", memberError);
        setLoading(false);
        return;
      }

      const planIds = memberData.map(member => member.plan_id);

      if (planIds.length > 0) {
        const { data: plansData, error: plansError } = await supabase
          .from('plans')
          .select('*')
          .in('id', planIds);

        if (plansError) {
          console.error("여행 계획 조회 실패:", plansError);
        } else {
          setPlans(plansData);
        }
      }
      setLoading(false);
    };

    fetchUserPlans();
  }, [navigate]);

  const handleCreatePlan = async (name: string, startDate: string, endDate: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert("로그인 세션이 만료되었습니다.");
      return;
    }

    // 1. 'plans' 테이블에 새로운 계획 생성
    const { data: newPlan, error: planError } = await supabase
      .from('plans')
      .insert({ creator_id: user.id, plan_name: name, start_date: startDate, end_date: endDate })
      .select()
      .single();

    if (planError || !newPlan) {
      alert("계획 생성에 실패했습니다: " + planError?.message);
      return;
    }

    // 2. 'plan_members' 테이블에 생성자를 멤버로 추가
    const { error: memberError } = await supabase
      .from('plan_members')
      .insert({ plan_id: newPlan.id, user_id: user.id });

    if (memberError) {
      alert("계획 멤버 추가에 실패했습니다: " + memberError.message);
      return;
    }

    // 3. 모든 DB 작업이 성공한 후, 생성된 계획 페이지로 이동
    setIsModalOpen(false);
    navigate(`/planning/${newPlan.id}`);
  };

  if (loading) return <p>여행 계획을 불러오는 중...</p>;

  return (
    <div style={{ padding: '20px' }}>
      <h1 style={{ marginBottom: '30px' }}>여행일정 관리</h1>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
        {plans.map(plan => (
          <PlanCard key={plan.id} plan={plan} />
        ))}
        <div
          onClick={() => setIsModalOpen(true)}
          style={{
            border: '2px dashed #ccc', borderRadius: '8px', width: '200px', height: '200px',
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
            flexDirection: 'column'
          }}
        >
          <span style={{ fontSize: '3em', color: '#ccc' }}>+</span>
          <p>새로운 여행 계획하기</p>
        </div>
      </div>
      <CreatePlanModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={handleCreatePlan}
      />
    </div>
  );
}