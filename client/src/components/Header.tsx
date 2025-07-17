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
    <div style={{ borderBottom: '1px solid black', padding: '10px' }}>
      <Link to="/" style={{ marginRight: '30px', color: 'black', textDecoration: 'none' }}>동행</Link>
      {!isLogin ? (
        <>
          <Link to="/signin">
            <button>로그인</button>
          </Link>
          <Link to="/signup">
            <button>회원가입</button>
          </Link>
        </>
      ) : (
        <button onClick={handleSignout}>로그아웃</button>
      )}
    </div>
  );
}