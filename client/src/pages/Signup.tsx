import supabase from "../api/supabaseClient";
import { useRef, useState } from "react";

export default function Signup() {
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const passwordCheckRef = useRef<HTMLInputElement>(null);
  const usernameRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState("");

  const handleSignupSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

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
        data: { nickname: username },
      },
    });

    if (error) {
      setMessage(`회원가입 실패: ${error.message}`);
      return;
    } else {
      setMessage("인증 메일이 발송되었습니다.");
    }

  };

  return (
    <>
    <form onSubmit={handleSignupSubmit}>
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
      <div>
        <input type="submit" value="회원가입"/>
      </div>
    </form>
      {message && <div>{message}</div>}
    </>
  );
}
