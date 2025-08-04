import { Link } from "react-router-dom";
import supabase from "../api/supabaseClient";
import useSession from "../hooks/useSesstion";
import { useEffect, useState } from "react";

export default function Home() {

  const isLogin = useSession();
  const [nickname, setNickname] = useState<String>("");
  const [loading, setLoading] = useState<Boolean>(true);

  useEffect(() => {
    // 로그인 상태일 때만 닉네임 조회
    setLoading(true);
    const fetchNickname = async () => {
      if (!isLogin) {
        setNickname("");
        setLoading(false);
        return;
      }
      // 현재 로그인한 유저 정보 가져오기
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) {
        setNickname("");
        return;
      }
      // user 테이블에서 닉네임 조회
      // console.log(user.id)
      const { data: userData, error: userError } = await supabase
        .from("userinfo") 
        .select("nickname")
        .eq("id", user.id)
        .single();

      if (userError || !userData) {
        setNickname("");
        console.log("select 오류");
        console.log(userError)
        return;
      }
      setNickname(userData.nickname);
      setLoading(false);
    };

    fetchNickname();
  }, [isLogin]);

  return (
    <>
      <div className="text-[50px] text-center">메인 페이지</div>
      {!loading &&
        <div className="mb-5 text-center">
          {isLogin ? (
            <span className="text-green-600">
              {nickname}님, 환영합니다!
            </span>
          ) : (
            <span className="text-red-600">로그인이 필요합니다.</span>
          )}
        </div>
      }
      
      <div className="text-center"><Link to="/planning">여행 계획 페이지</Link></div>
      <div className="text-center"><Link to="/placeInformation">관광지 정보 페이지</Link></div>
      <div className="text-center"><Link to="/plans">내 일정 관리</Link></div>
      
    </>
  )
}