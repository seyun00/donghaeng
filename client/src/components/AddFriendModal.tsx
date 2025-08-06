import React, { useState } from "react";
import supabase from "../api/supabaseClient";

type UserInfo = {
  id: string;
  email: string;
  nickname: string;
};

type AddFriendModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSendRequest: (targetUserId: string) => void;
  currentUserId: string;
  friendIds: string[];
};

export default function AddFriendModal({ isOpen, onClose, onSendRequest, currentUserId, friendIds }: AddFriendModalProps) {
  const [searchEmail, setSearchEmail] = useState("");
  const [searchResults, setSearchResults] = useState<UserInfo[]>([]);

  const handleSearch = async () => {
    if (!searchEmail) {
      alert("이메일을 입력해주세요.");
      return;
    }

    const { data, error } = await supabase
      .from("userinfo")
      .select("id, email, nickname")
      .ilike("email", `%${searchEmail}%`)
      .neq("id", currentUserId)
      .limit(5);

    if (error) {
      alert("검색 중 오류가 발생했습니다: " + error.message);
      return;
    }

    setSearchResults(data ?? []);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <div className="bg-white p-6 rounded shadow-md w-[400px]">
        <div className="flex justify-between mb-2">
          <h3 className="inline text-xl">친구 추가하기</h3>
          <button onClick={onClose} ><img src="icons/icon-cancle.png" alt="닫기" className="w-4 " /></button>
        </div>
        <div className="flex justify-between">
          <input
            type="email"
            placeholder="이메일로 검색"
            value={searchEmail}
            onChange={(e) => setSearchEmail(e.target.value)}
            className="w-[250px] p-2 mb-3 border rounded"
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          <button
            onClick={handleSearch}
            className="px-4 py-2 mb-4 text-white bg-blue-500 rounded hover:bg-blue-600"
          >
            검색
          </button>
        </div>
        <div>
          {searchResults.length === 0 && <p>검색 결과가 없습니다.</p>}
          <ul>
            {searchResults.map((user) => {
              const isFriend = friendIds.includes(user.id);
              return (
                <li key={user.id} className="flex items-center justify-between mb-2">
                  <div>
                    <div><b>닉네임:</b> {user.nickname}</div>
                    <div><b>이메일:</b> {user.email}</div>
                  </div>
                  <button
                    className={`px-3 py-1 text-white rounded 
                      ${isFriend ? 'bg-gray-400' : 'bg-green-500 hover:bg-green-600'}`}
                    onClick={() => !isFriend && onSendRequest(user.id)}
                    disabled={isFriend}
                  >
                    친구 요청
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
        
      </div>
    </div>
  );
}
