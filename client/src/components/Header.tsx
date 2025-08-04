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
    <div className="border-b-2 border-gray-100">
      <div className="py-[10px] px-[20px] flex justify-between max-w-[1024px] m-auto">
        <Link to="/">동행</Link>
        
        <div>
          {!isLogin ? (
            <>
              <Link to="/signin">
                <button className="mr-4">로그인</button>
              </Link>
              <Link to="/signup">
                <button>회원가입</button>
              </Link>
            </>
          ) : (
            <>
              <button onClick={handleSignout} className="mr-4">로그아웃</button>
              <Link to="/mypage"><button>내 정보</button></Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}