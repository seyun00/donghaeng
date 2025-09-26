// /src/pages/Home.tsx

import { Link, useNavigate } from "react-router-dom";
import supabase from "../api/supabaseClient";
import useSession from "../hooks/useSesstion";
import { useEffect, useState } from "react";

// Plan 타입 정의
interface Plan {
  id: number;
  plan_name: string;
  start_date: string;
  end_date: string;
}

// PlanCard 컴포넌트 (PlanManagement.tsx에서 가져와 스타일 개선)
const PlanCard = ({ plan }: { plan: Plan }) => {
  return (
    <Link to={`/planning/${plan.id}`} className="block">
      <div className="border rounded-lg p-4 h-48 flex flex-col justify-between shadow-md hover:shadow-lg transition-shadow bg-white">
        <div>
          <h3 className="text-lg font-bold truncate">{plan.plan_name}</h3>
          <p className="text-sm text-gray-500 mt-1">
            {plan.start_date} ~ {plan.end_date}
          </p>
        </div>
        <button className="w-full py-2 text-sm font-semibold text-white bg-blue-500 rounded-md hover:bg-blue-600 transition-colors">
          계획 보기
        </button>
      </div>
    </Link>
  );
};


export default function Home() {
  const isLogin = useSession();
  const navigate = useNavigate();
  const [nickname, setNickname] = useState<String>("");
  const [loading, setLoading] = useState<Boolean>(true);
  const [plans, setPlans] = useState<Plan[]>([]); 

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      if (!isLogin) {
        setNickname("");
        setPlans([]);
        setLoading(false);
        return;
      }
      
      // 1. 현재 로그인한 유저 정보 가져오기
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setNickname("");
        setLoading(false);
        return;
      }

      // 2. userinfo 테이블에서 닉네임 조회
      const { data: userData } = await supabase
        .from("userinfo") 
        .select("nickname")
        .eq("id", user.id)
        .single();
      
      if (userData) {
        setNickname(userData.nickname);
      }

      // 3. 사용자가 참여중인 모든 여행 계획 ID 조회
      const { data: memberData } = await supabase
        .from('plan_members')
        .select('plan_id')
        .eq('user_id', user.id);

      if (memberData && memberData.length > 0) {
        const planIds = memberData.map(member => member.plan_id);
        
        // 4. 해당 ID를 가진 여행 계획들의 상세 정보 조회
        const { data: plansData } = await supabase
          .from('plans')
          .select('*')
          .in('id', planIds)
          .order('start_date', { ascending: false }); // 최근 일정부터 정렬
        
        if (plansData) {
          setPlans(plansData);
        }
      } else {
        setPlans([]);
      }

      setLoading(false);
    };

    fetchInitialData();
  }, [isLogin]);

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto">
        
        {!loading &&
          <div className="mb-8 text-center">
            {isLogin ? (
              <p className="text-xl">
                <span className="font-semibold text-indigo-600">{nickname}</span>님, 환영합니다!
              </p>
            ) : (
              <p className="text-lg">여행 계획을 시작하려면 <Link to="/signin" className="text-blue-500 hover:underline">로그인</Link>이 필요합니다.</p>
            )}
          </div>
        }
        
        {/* 로그인 시에만 내 여행 일정 섹션 표시 */}
        {isLogin && !loading && (
          <div className="mb-12">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">내 여행 일정</h2>
              <Link to="/plans">
                <button className="px-4 py-2 text-sm font-semibold text-white bg-green-500 rounded-md hover:bg-green-600 transition-colors">
                  새 계획 만들기
                </button>
              </Link>
            </div>
            {plans.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {plans.map(plan => (
                  <PlanCard key={plan.id} plan={plan} />
                ))}
              </div>
            ) : (
              <div className="text-center py-10 bg-white rounded-lg shadow-sm">
                <p className="text-gray-500">아직 참여중인 여행 계획이 없습니다.</p>
              </div>
            )}
          </div>
        )}

        {/* qㅓ튼 링크 */}
        <div className="p-6 bg-white rounded-lg shadow-sm">
            <h2 className="text-2xl font-bold mb-4">관광 정보 검색</h2>
            <div className="flex justify-center items-center gap-6">
              <Link to="/placeInformation">
                <button className="px-8 py-3 text-lg font-semibold text-white bg-indigo-600 rounded-lg shadow-md hover:bg-indigo-700 transition-transform hover:scale-105">
                  관광지 정보
                </button>
              </Link>
              <Link to="/searchSharedPlan">
                <button className="px-8 py-3 text-lg font-semibold text-white bg-teal-500 rounded-lg shadow-md hover:bg-teal-600 transition-transform hover:scale-105">
                  공유 코스 검색
                </button>
              </Link>
            </div>
        </div>
      </div>
    </div>
  );
}
