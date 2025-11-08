// /src/pages/Home.tsx

import { Link, useNavigate } from "react-router-dom";
import supabase from "../api/supabaseClient";
import useSession from "../hooks/useSesstion";
import { useEffect, useRef, useState } from "react";
import Carousel from "../components/Carousel";
import Banner from "../components/Banner";

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
      <div className="flex flex-col justify-between h-48 p-4 transition-shadow bg-white border rounded-lg shadow-md hover:shadow-lg">
        <div>
          <h3 className="text-lg font-bold truncate">{plan.plan_name}</h3>
          <p className="mt-1 text-sm text-gray-500">
            {plan.start_date} ~ {plan.end_date}
          </p>
        </div>
        <button className="w-full py-2 text-sm font-semibold text-white transition-colors bg-blue-500 rounded-md hover:bg-blue-600">
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
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-5xl mx-auto">
        
        {!loading && !isLogin && (
          <>
            <Carousel />
            <div className="mb-8 text-center">
              <p className="text-lg">
                국내 여행에 관한 모든 정보를 한 곳에서, <br />
                일정 계획부터 관광지 추천까지 모두 경험해보세요!
              </p>
            </div>
            <div className="mb-8 text-center">
            <p className="text-lg">
              여행 계획을 시작하려면{" "}
              <Link to="/signin" className="text-blue-500 hover:underline">로그인</Link>이 필요합니다.
            </p>
            </div>
          <Banner/>
          </>
        )}
        
        {/* 로그인 시에만 내 여행 일정 섹션 표시 */}
        {isLogin && !loading && (
          <>
            <div className="mb-12">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">내 여행 일정</h2>
                <Link to="/plans">
                  <button className="px-4 py-2 text-sm font-semibold text-white transition-colors bg-green-500 rounded-md hover:bg-green-600">
                    새 계획 만들기
                  </button>
                </Link>
              </div>
              {plans.length > 0 ? (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {plans.map(plan => (
                    <PlanCard key={plan.id} plan={plan} />
                  ))}
                </div>
              ) : (
                <div className="py-10 text-center bg-white rounded-lg shadow-sm">
                  <p className="text-gray-500">아직 참여중인 여행 계획이 없습니다.</p>
                </div>
              )}
            </div>
            <Banner/>
          </>
        )}
        
      </div>
    </div>
  );
}