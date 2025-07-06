import supabase from "../api/supabaseClient";
import { useRef, useState } from "react";

export default function Signup() {
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const passwordCheckRef = useRef<HTMLInputElement>(null);
  const usernameRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState("");

  const handleSignupBtn = async () => {
    const email = emailRef.current?.value || "";
    const password = passwordRef.current?.value || "";
    const passwordCheck = passwordCheckRef.current?.value || "";
    const username = usernameRef.current?.value || "";

    if (!email || !password || !username) {
      setMessage("모든 필드를 입력해주세요.");
      return;
    }
    if (password !== passwordCheck) {
      setMessage("비밀번호가 일치하지 않습니다.");
      return;
    }

    // Supabase 회원가입
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username },
      },
    });

    if (error) {
      setMessage(`회원가입 실패: ${error.message}`);
      return;
    } else {
      setMessage("회원가입 성공!");
    }

    // user 테이블에 추가 정보 저장
    const userData = await supabase.from("user").insert({
      id: data.user?.id,
      email: data.user?.email,
      created_at: data.user?.created_at,
      nickname: username,
    });

    console.log(userData);
  };

  return (
    <>
      <div>
        <input type="email" placeholder="이메일" ref={emailRef} />
      </div>
      <div>
        <input type="password" placeholder="비밀번호" ref={passwordRef} />
      </div>
      <div>
        <input type="password" placeholder="비밀번호 확인" ref={passwordCheckRef} />
      </div>
      <div>
        <input type="text" placeholder="사용자 이름" ref={usernameRef} />
      </div>
      <button onClick={handleSignupBtn}>회원가입</button>
      {message && <div>{message}</div>}
    </>
  );
}
