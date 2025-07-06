import { Link } from "react-router-dom"
import supabase from "../api/supabaseClient"
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
      console.log(user.id)
      const { data: userData, error: userError } = await supabase
        .from("user") 
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
      <h1>메인 페이지</h1>
      {!loading &&
      <div style={{ marginBottom: "20px" }}>
        {isLogin ? (
          <span style={{ color: "green" }}>
            {nickname}님, 환영합니다!
            </span>
        ) : (
          <span style={{ color: "red" }}>로그인이 필요합니다.</span>
        )}
      </div>
      }
      <Link to="/planning">
        <button>여행 계획 페이지</button>
      </Link>
      <Link to="/placeInformation">
        <button>관광지 정보 페이지</button>
      </Link>
    </>
  )
}