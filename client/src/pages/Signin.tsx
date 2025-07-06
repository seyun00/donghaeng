import { useRef, useState } from "react";
import supabase from "../api/supabaseClient";
import { useNavigate } from "react-router-dom";

export default function Signin() {
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState("");
  
  const navigate = useNavigate();

  const handleSigninBtn = async () => {
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

  return (
    <>
      <div><input type="text" placeholder="이메일" ref={emailRef}/></div>
      <div><input type="password" placeholder="비밀번호" ref={passwordRef}/></div>
      <button onClick={handleSigninBtn}>로그인</button>
      {message && <div>{message}</div>}
    </>
  )
}