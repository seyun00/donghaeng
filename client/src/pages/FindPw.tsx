import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../api/supabaseClient";

export default function FindPw() {
  const emailRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleFindPwSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const email = emailRef.current?.value || "";

    if (!email) {
      setMessage("이메일을 입력해주세요.");
      return;
    }

    // 여기에 redirectTo 옵션 추가 - 비밀번호 재설정 페이지로
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/resetPw`,
    });

    if (error) {
      setMessage(`메일 발송 실패: ${error.message}`);
    } else {
      setMessage("비밀번호 재설정 메일이 발송되었습니다. 이메일을 확인해주세요.");
      // 리디렉션 코드는 반드시 이메일 링크 클릭 시 수행되므로 여기는 필요 없음
    }
  };

  return (
    <div className="h-[100vh] bg-gray-100 pt-10">
      <div className="max-w-[1024px] m-auto bg-white h-[70vh] pt-10">
        <div className="text-[30px] text-center font-medium py-[20px]">비밀번호 찾기</div>
        <form onSubmit={handleFindPwSubmit}>
          <div className="m-auto max-w-[300px] px-[15px] py-[8px] rounded-[25px] bg-gray-100 mb-2">
            <input type="text" placeholder="이메일을 입력하세요" ref={emailRef} className="w-full bg-transparent focus:outline-none" />
          </div>
          <div className="m-auto max-w-[300px] px-[15px] py-[8px] rounded-[25px] bg-gray-100 mb-2 hover:bg-gray-200 mt-4">
            <input type="submit" value="이메일 인증" className="w-full text-center" />
          </div>
          <div className="m-auto max-w-[330px] px-[15px] rounded-[25px] text-xs text-gray-400 text-center mt-4">
            ㆍ아이디(이메일)를 입력후 이메일 인증 버튼을 클릭하시면 비밀번호를 변경하실 수 있습니다.
          </div>
          <div className="m-auto max-w-[330px] px-[15px] rounded-[25px] text-xs text-gray-400 text-center mt-4">
            ㆍ소셜 로그인 계정은 해당 기능을 이용하실 수 없습니다.
          </div>
          {message && <div className="m-auto max-w-[300px] text-center mt-4 text-sm text-red-400">{message}</div>}
        </form>
      </div>
    </div>
  );
}
