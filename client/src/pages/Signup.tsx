import supabase from "../api/supabaseClient"
import { useState } from "react";

export default function Signup() {
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordCheck, setPasswordCheck] = useState("");
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState("");

  const handleSignupBtn = async () => {
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
        data: { username }, // 추가 사용자 정보 저장
      },
    });

    if (error) {
      setMessage(`회원가입 실패: ${error.message}`);
    } else {
      setMessage("회원가입 성공!");
    }

    const userData = await supabase.from("user").insert({
      id: data.user?.id, // 회원가입 성공 시 받아온 data중 id(uid) 값을 가져온다.
      email: data.user?.email,
      created_at: data.user?.created_at, 
      nickname: username
    });

    console.log(userData);
  };

  return (
    <>
      <div><input type="email" placeholder="이메일" value={email}onChange={(e) => setEmail(e.target.value)}/></div>
      <div><input type="password" placeholder="비밀번호" value={password}onChange={(e) => setPassword(e.target.value)}/></div>
      <div><input type="password" placeholder="비밀번호 확인" value={passwordCheck}onChange={(e) => setPasswordCheck(e.target.value)}/></div>
      <div><input type="text" placeholder="사용자 이름" value={username}onChange={(e) => setUsername(e.target.value)}/></div>

      <button onClick={handleSignupBtn}>회원가입</button>

      {message && <div>{message}</div>}
    </>
  )
}