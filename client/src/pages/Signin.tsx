import { useRef, useState } from "react";
import supabase from "../api/supabaseClient";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

export default function Signin() {
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState("");
  
  const navigate = useNavigate();

  // 일반 로그인
  const handleSigninSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const email = emailRef.current?.value || "";
    const password = passwordRef.current?.value || "";

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage(`로그인 실패: ${error.message}`);
    } else {
      setMessage("로그인 성공!! 3초 후 홈으로 이동합니다.");
      setTimeout(() => {
        navigate("/");
      }, 3000);
    }
    
  };

  // 구글 로그인
  const handleSigninGoogle = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        queryParams: {
          access_type: 'offline',
          prompt: 'consent'
        }
      }
    })
    if (error) {
      console.error("구글 로그인 실패: ", error.message);
      return;
    }  
  }

  const handleSigninKakao = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'kakao',
    });
    if (error) {
      console.error("카카오 로그인 실패: ", error.message);
      return;
    }  
  }

  return (
    <div className="h-[100vh] bg-gray-100 pt-10">
      <div className="max-w-[1024px] m-auto bg-white h-[70vh] pt-10">
        <div className="text-[30px] text-center font-medium py-[20px]">로그인</div>
        
        <form onSubmit={handleSigninSubmit}>
          <div className="m-auto max-w-[300px] px-[15px] rounded-[25px] ">아이디(이메일)</div>
          <div className="m-auto max-w-[300px] px-[15px] py-[8px] rounded-[25px] bg-gray-100 mb-2">
            <input type="text" ref={emailRef} className="w-full bg-transparent focus:outline-none"/>
          </div>
          
          <div className="m-auto max-w-[300px] px-[15px] rounded-[25px] ">비밀번호</div>
          <div className="m-auto max-w-[300px] px-[15px] py-[8px] rounded-[25px] bg-gray-100 mb-2">
            <input type="password" ref={passwordRef} className="w-full bg-transparent focus:outline-none"/>
          </div>
          
          <div className="m-auto max-w-[300px] px-[15px] py-[8px] rounded-[25px] bg-gray-100 mb-2 hover:bg-gray-200">
            <input type="submit" value="로그인" className="w-full text-center"/>
          </div>
        </form>
        
        <div className="m-auto max-w-[300px] flex justify-between mb-2">
          <Link to="/signup" className="text-gray-400">회원가입</Link>
          <Link to="" className="text-gray-400">아이디/비밀번호 찾기</Link>
        </div>
        
        <div className="m-auto max-w-[300px] flex justify-around">
            <button onClick={handleSigninGoogle} className="w-[130px] py-1 bg-gray-100 rounded-[25px]">
              <img src="/assets/google.png" alt="이미지 없음" className="inline w-6" />
            </button>
            <button onClick={handleSigninKakao} className="w-[130px] py-1 rounded-[25px] bg-yellow-300">
              <img src="/assets/kakao.png" alt="이미지 없음" className="inline w-12" />
            </button>
        </div>
        {message && <div className="m-auto max-w-[300px] text-center">{message}</div>}
      </div>
    </div>
  )
}