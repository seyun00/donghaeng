import { Link } from "react-router-dom";
import supabase from "../api/supabaseClient";
import useSession from "../hooks/useSesstion";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

export default function Header() {
  const navigate = useNavigate();
  const isLogin = useSession();

  const [modalOpen, setModalOpen] = useState(false);
  const [requests, setRequests] = useState<any[]>([]);

  // 로그아웃
  const handleSignout = async () => {
    if (window.confirm("로그아웃하시겠습니까?")) {
      try {
        await supabase.auth.signOut();
        navigate("/");
      } catch (error) {
        console.log(error);
      }
    };
  }

  const fetchUserId = async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) {
        alert("로그인이 필요합니다.");
        navigate('/signin');
        return;
      }
      return user.id;
  }
  // 친구 요청 조회
  const fetchFriendRequests = async () => {
    
    const userId = await fetchUserId();
    if (!userId) return;
    
    const { data: requests, error } = await supabase
      .from("friends")
      .select("id, requester_id, status")
      .eq("addressee_id", userId)
      .eq("status", "pending")
      .order("id", { ascending: false });
    if (error) {
      alert("친구 요청 조회 오류: " + error.message);
      setRequests([]);
      return;
    }
    console.log(userId);
    console.log(requests);

    const requesterIds = [];
    for (let i = 0; i < requests.length; i++) {
      const id = requests[i].requester_id;
      if (requesterIds.indexOf(id) === -1) {
        requesterIds.push(id);
      }
    }
    
    const { data: userInfos, error: userError } = await supabase
      .from("userinfo")
      .select("id, nickname, email")
      .in("id", requesterIds);
    if (userError) {
      alert("유저 정보 조회 오류: " + userError.message);
      setRequests([]);
      return;
    }
    
    const requestsWithUserInfo = requests.map(req => {
      const userInfo = userInfos.find(u => u.id === req.requester_id);
      return {
        ...req,
        requester: userInfo || { nickname: "알 수 없음", email: "" },
      };
    });
    setRequests(requestsWithUserInfo);
    setModalOpen(true);
  };

  // 알림 수락 버튼
  const handleAccept = async (friendRequestId: string) => {
    if (!window.confirm("요청을 수락하시겠습니까?")) {
      return;
    }
    
    const { error } = await supabase
      .from("friends")
      .update({ status: "accepted" })
      .eq("id", friendRequestId);
  
    if (error) {
      alert("수락 실패: " + error.message);
      return;
    }
    alert("요청이 수락되었습니다.");
    setRequests(prev => prev.filter(r => r.id !== friendRequestId));
  };

  // 알림 거절 버튼
  const handleReject = async (friendRequestId: string) => {
    if (!window.confirm("요청을 거절하시겠습니까?")) {
      return;
    }

    const { error } = await supabase
      .from("friends")
      .update({ status: "rejected" })
      .eq("id", friendRequestId);
  
    if (error) {
      alert("거부 실패: " + error.message);
      return;
    }
    
    alert("요청이 거절되었습니다.");
    setRequests(prev => prev.filter(r => r.id !== friendRequestId));
  };

  return (
    <>
      <div className="border-b-2 border-gray-100">
        <div className="py-[10px] px-[20px] flex justify-between max-w-[1280px] m-auto items-center">
          <Link to="/">
            <img src="/icons/logo.png" alt="" className="w-14"/>
          </Link>
          
          <div>
            {!isLogin ? (
              <>
                <Link to="/signin">
                  <button className="mr-4">로그인</button>
                </Link>
                <Link to="/signup">
                  <button>회원가입</button>
                </Link>
              </>
            ) : (
              <>
                <button onClick={handleSignout} className="mr-4">로그아웃</button>
                <Link to="/mypage" className="mr-4"><button>내 정보</button></Link>
                <button onClick={fetchFriendRequests}>🔔</button>
              </>
            )}
          </div>
        </div>
      </div>
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-25">
          <div className="p-6 bg-white rounded shadow-lg w-96">
            <div className="flex justify-between mb-2">
              <h3 className="inline font-semibold">친구 요청 알림</h3>
              <button onClick={() => setModalOpen(false)} ><img src="icons/icon-cancle.png" alt="닫기" className="w-4 " /></button>
            </div>
            {requests.length === 0 ? (
              <div>도착한 알림이 없습니다.</div>
            ) : (
              <ul>
                {requests.map(req => (
                  <li key={req.id} className="flex items-center justify-between mb-3">
                    <div>
                      <div>{req.requester.nickname} ({req.requester.email})</div>
                    </div>
                    <div>
                      <button
                        onClick={() => handleAccept(req.id)}
                        className="px-2 py-0.5 mr-2 text-white bg-green-500 rounded-[5px] hover:bg-green-600"
                      >수락</button>
                      <button
                        onClick={() => handleReject(req.id)}
                        className="px-2 py-0.5 mr-2 text-white bg-red-400 rounded-[5px] hover:bg-red-500"
                      >거절</button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

    </>
  );
}