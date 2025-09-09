import { useRef, useState } from "react";
import supabase from "../api/supabaseClient";
import { useNavigate } from "react-router-dom";

export default function ResetPw() {
  const passwordRef = useRef<HTMLInputElement>(null);
  const passwordCheckRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  // 새 비밀번호 재설정 처리
  const handleResetSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const password = passwordRef.current?.value || "";
    const passwordCheck = passwordCheckRef.current?.value || "";

    if (!password || !passwordCheck) {
      setMessage("비밀번호를 모두 입력해주세요.");
      return;
    }
    if (password !== passwordCheck) {
      setMessage("비밀번호가 일치하지 않습니다.");
      return;
    }

    // 비밀번호 변경 API 호출
    const { data, error } = await supabase.auth.updateUser({
      password: password,
    });

    if (error) {
      setMessage(`비밀번호 재설정 실패: ${error.message}`);
    } else {
      window.alert("비밀번호가 성공적으로 변경되었습니다.");
      // 변경 성공 후 로그인 페이지 또는 루트로 리디렉션
      navigate("/signin");
    }
  };

  return (
    <div className="h-[100vh] bg-gray-100 pt-10">
      <div className="max-w-[1024px] m-auto bg-white h-[70vh] pt-10">
        <div className="text-[30px] text-center font-medium py-[20px]">비밀번호 재설정</div>
        <form onSubmit={handleResetSubmit}>
          <div className="m-auto max-w-[300px] px-[15px] py-[8px] rounded-[25px] bg-gray-100 mb-2">
            <input
              type="password"
              placeholder="비밀번호 입력"
              ref={passwordRef}
              className="w-full bg-transparent focus:outline-none"
            />
          </div>
          <div className="m-auto max-w-[300px] px-[15px] py-[8px] rounded-[25px] bg-gray-100 mb-2">
            <input
              type="password"
              placeholder="비밀번호 재입력"
              ref={passwordCheckRef}
              className="w-full bg-transparent focus:outline-none"
            />
          </div>
          <div className="m-auto max-w-[300px] px-[15px] py-[8px] rounded-[25px] bg-gray-100 mb-2 hover:bg-gray-200 mt-4">
            <input type="submit" value="재설정" className="w-full text-center" />
          </div>
        </form>
        {message && <div className="m-auto max-w-[300px] text-center mt-4">{message}</div>}
      </div>
    </div>
  );
}
