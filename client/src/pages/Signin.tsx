import { useRef, useState } from "react";
import supabase from "../api/supabaseClient";
import { useNavigate } from "react-router-dom";

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
    <>
      <form onSubmit={handleSigninSubmit}>
      <div><input type="text" placeholder="이메일" ref={emailRef}/></div>
      <div><input type="password" placeholder="비밀번호" ref={passwordRef}/></div>
      <div><input type="submit" value="로그인"/></div>
      </form>
      <div>
        <button onClick={handleSigninGoogle}>GOOGLE</button>
        <button onClick={handleSigninKakao}>KAKAO</button>
        <button>NAVER</button>
      </div>
      {message && <div>{message}</div>}
    </>
  )
}