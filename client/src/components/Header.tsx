import { Link } from "react-router-dom";
import supabase from "../api/supabaseClient";
import useSession from "../hooks/useSesstion";
import { useNavigate } from "react-router-dom";

export default function Header() {
  const navigate = useNavigate();
  const isLogin = useSession();

  const handleSignout = async () => {
    if (window.confirm("로그아웃하시겠습니까?")) {
      try {
        await supabase.auth.signOut();
        navigate("/");
      } catch (error) {
        console.log(error);
      }
    };
  }

  return (
    <div className="py-[10px] px-[20px] border-b-2 border-black flex justify-between">
      <Link to="/" className="font-bold">동행</Link>
      
      <div>
        {!isLogin ? (
          <>
            <Link to="/signin" className="">
              <button className="mr-4">로그인</button>
            </Link>
            <Link to="/signup">
              <button>회원가입</button>
            </Link>
          </>
        ) : (
          <>
            <button onClick={handleSignout} className="mr-4">로그아웃</button>
            <button>내 정보</button>
          </>
        )}
      </div>
    </div>
  );
}