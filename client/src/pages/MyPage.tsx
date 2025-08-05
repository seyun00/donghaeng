import { useState } from "react";

export default function MyPage () {
  const [menu, setMenu] = useState<String>("edit_info");
  return (
      <div className="bg-gray-100 h-[100vh] pt-10">
        <div className="max-w-[1024px] m-auto h-4/5 bg-white flex justify-between">
          
          <div className="flex flex-col border-r w-[15%]">
            <button className="mt-4" onClick={() => {setMenu("edit_info")}}>회원정보 변경</button>
            <button className="mt-4" onClick={() => {setMenu("my_schedule")}}>내 여행 일정</button>
            <button className="mt-4" onClick={() => {setMenu("my_place")}}>찜 리스트</button>
            <button className="mt-4" onClick={() => {setMenu("my_review")}}>내가 쓴 리뷰</button>
            <button className="mt-4" onClick={() => {setMenu("edit_firends")}}>친구 관리</button>
          </div>
          
          <div className="w-full py-[5vh] px-[5vw]">
            {menu === "edit_info" && 
              <>
                <div className="text-[32px]">회원정보 변경</div>
                <div className="flex justify-between p-5 h-3/5">
                  <div className="text-center">
                    <div className="inline-block w-[120px] h-[120px] bg-gray-100 rounded-[20px] text-center">
                      <div>등록된 이미지가 없습니다.</div>
                    </div>
                    <button>이미지 수정</button>
                  </div>
                  <div className="w-full pr-10 ml-5 text-right">
                    <div className="mb-4">아이디(이메일) <input type="text" value={"123@naver.com"} disabled className="px-2 py-1 ml-4 bg-gray-100 rounded-[10px]"/></div>
                    <div className="mb-4">이름 <input type="text" value={"가나다"} className="px-2 py-1 ml-4 bg-gray-100 rounded-[10px]"/></div>
                    <div className="mb-4">변경 비밀번호 <input type="password" className="px-2 py-1 ml-4 bg-gray-100 rounded-[10px]"/></div>
                    <div className="mb-4">비밀번호 재입력 <input type="password" className="px-2 py-1 ml-4 bg-gray-100 rounded-[10px]"/></div>
                    <button className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-[10px]">변경</button>
                  </div>
                </div>
              </>
            }
            {menu === "my_schedule" && 
              <div className="text-[32px]">내 여행 일정</div>
            }
            {menu === "my_place" && 
              <div className="text-[32px]">찜 리스트</div>
            }
            {menu === "my_review" && 
              <div className="text-[32px]">내가 쓴 리뷰</div>
            }
            {menu === "edit_firends" && 
              <div className="text-[32px]">친구 관리</div>
            }
          </div>
          
        </div>
      </div>
  );
}