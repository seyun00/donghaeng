import { useEffect, useState } from "react";
import supabase from "../api/supabaseClient";
import { useNavigate } from "react-router-dom";
import AddFriendModal from "../components/AddFriendModal";

export default function MyPage () {
  const [menu, setMenu] = useState<string>("edit_info");
  
  const [userId, setUserId] = useState<string>("");
  const [nickName, setNickName] = useState<string>("");
  const [email, setEmail] = useState("");
  const [profileUrl, setProfileUrl] = useState<string | null>(null);
  const [isSocialLogin, setIsSocialLogin] = useState(false);

  const [uploading, setUploading] = useState(false);

  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirm, setNewPasswordConfirm] = useState("");
  
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) {
        alert("로그인이 필요합니다.");
        navigate('/signin');
        return;
      }
      setUserId(user.id);

      const socialLogin = user.identities?.some(identity => identity.provider !== "email") ?? false;
      setIsSocialLogin(socialLogin);

      const { data: userData, error: userError } = await supabase
        .from("userinfo") 
        .select("*")
        .eq("id", user.id)
        .single();
        
      if (userError || !userData) {
        console.log("select 오류");
        console.log(userError)
        return;
      }
      const email_asterisk = userData.email.slice(0,6)+'*'.repeat(6);
      setEmail(email_asterisk);
      setNickName(userData.nickname);
      setProfileUrl(userData.profile_url);
      setLoading(false);
    };
    
    fetchUserData();
  }, [navigate]);

  // 개인정보 수정 핸들러 함수
  const handleUpdate = async () => {
    if (!window.confirm("회원정보를 수정하시겠습니까?")) {
      return;
    }
    
    let updateFields = { nickname: nickName };
    if (newPassword) {
      if (newPassword !== newPasswordConfirm) {
        alert("비밀번호가 일치하지 않습니다.");
        return;
      }
      // supabase auth에서 비밀번호 변경
      const { error: pwError } = await supabase.auth.updateUser({
        password: newPassword
      });
      if (pwError) {
        alert("비밀번호 변경 실패: " + pwError.message);
        return;
      }
    }

    // userinfo table 닉네임 업데이트
    const { error: updateError } = await supabase
      .from("userinfo")
      .update(updateFields)
      .eq("id", userId);

    if (updateError) {
      alert("회원정보 변경 실패: " + updateError.message);
      return;
    }
    alert("회원정보가 성공적으로 수정되었습니다.");
  };

  // 프로필 사진 수정
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files ? event.target.files[0] : null;
    if (!file) return;
    
    setUploading(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}_${Date.now()}.${fileExt}`;
    
    // Supabase Storage에 프로필 이미지 업로드
    const { data, error } = await supabase.storage
      .from('profileimage')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });
    
    if (error) {
      alert("파일 업로드 실패: " + error.message);
      setUploading(false);
      return;
    }
  
    // 이미지 url 생성 (public 버킷이라면 아래 방식, private이면 signed URL 필요)
    const { data: publicUrlData } = supabase
      .storage
      .from('profileimage')
      .getPublicUrl(fileName);
  
    const imageUrl = publicUrlData.publicUrl;
  
    // userinfo 테이블에 profile_url 업데이트
    const { error: updateError } = await supabase
      .from('userinfo')
      .update({ profile_url: imageUrl })
      .eq('id', userId);
  
    if (updateError) {
      alert("프로필 주소 업데이트 실패: " + updateError.message);
      setUploading(false);
      return;
    }
  
    setProfileUrl(imageUrl);
    setUploading(false);
    alert("프로필 이미지가 성공적으로 변경되었습니다.");
  };

  // 친구 리스트 불러오기
  type Friend = {
    id: string;
    email: string;
    nickname: string;
  };
  
  const [friendsList, setFriendsList] = useState<Friend[]>([]);

  const fetchFriends = async () => {
    if (!userId) return;
    
    const { data, error } = await supabase
      .from('friend_details')
      .select('*')
      .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`)
      .eq('status', 'accepted');
    
    if (error) {
      console.error(error);
      return;
    }
  
    const friends = data.map(f => {
      if (f.requester_id === userId) {
        return {
          id: f.addressee_id,
          email: f.addressee_email,
          nickname: f.addressee_nickname,
        };
      } else {
        return {
          id: f.requester_id,
          email: f.requester_email,
          nickname: f.requester_nickname,
        };
      }
    });
  
    setFriendsList(friends);
  };

  const friendIds = friendsList.map(friend => friend.id); 

  useEffect(() => {
    if (userId) {
      fetchFriends();
    }
  }, [userId]);

  // 친구 추가 모달창 기능
  const [modalOpen, setModalOpen] = useState(false);

  const handleSendFriendRequest = async (targetUserId: string) => {
    try {
      if (targetUserId === userId) {
        alert("본인에게 친구 요청을 보낼 수 없습니다.");
        return;
      }
    
      // 서로 중복 신청 방지를 위해, userId가 requester 또는 addressee인 경우 모두 탐색
      const { data: existingRequest, error: fetchError } = await supabase
        .from("friends")
        .select("id, status, requester_id, addressee_id")
        .or(
          `and(requester_id.eq.${userId},addressee_id.eq.${targetUserId}),and(requester_id.eq.${targetUserId},addressee_id.eq.${userId})`
        )
        .maybeSingle();
      
      if (fetchError && fetchError.code !== "PGRST116") {
        alert("친구 요청 상태 조회 중 오류가 발생했습니다: " + fetchError.message);
        return;
      }
    
      if (!existingRequest) {
        // 신규 요청 삽입
        const { error: insertError } = await supabase
          .from("friends")
          .insert({
            requester_id: userId,
            addressee_id: targetUserId,
            status: "pending",
          });
        
        if (insertError) {
          alert("친구 요청 중 오류가 발생했습니다: " + insertError.message);
        } else {
          alert("친구 요청이 전송되었습니다.");
          setModalOpen(false);
        }
      
      } else {
        const currentStatus = existingRequest.status;
      
        if (currentStatus === "rejected" || currentStatus === "deleted") {
          // 기존 거부/삭제 상태면 상태 갱신
          const { error: updateError } = await supabase
            .from("friends")
            .update({ status: "pending" })
            .eq("id", existingRequest.id);
        
          if (updateError) {
            alert("친구 요청 전송 중 오류가 발생했습니다: " + updateError.message);
          } else {
            alert("친구 요청이 전송되었습니다.");
            setModalOpen(false);
          }
        } else if (currentStatus === "pending") {
          alert("이미 친구 요청이 대기 중입니다.");
        } else if (currentStatus === "accepted") {
          alert("이미 친구인 상태입니다.");
        } else {
          alert(`현재 친구 요청 상태: ${currentStatus}`);
        }
      }
    } catch (err) {
      console.error(err);
      alert("친구 요청 처리 중 알 수 없는 오류가 발생했습니다.");
    }
  };

  const handleDelete = async (friendUserId: string) => {
    if (!window.confirm("이 친구를 삭제하시겠습니까?")) return;
    
    const { error } = await supabase
      .from("friends")
      .update({ status: "deleted" })
      .or(
        `and(requester_id.eq.${userId},addressee_id.eq.${friendUserId}),and(requester_id.eq.${friendUserId},addressee_id.eq.${userId})`
      );
    
    if (error) {
      alert("친구 삭제에 실패했습니다: " + error.message);
      return;
    }
  
    alert("친구가 삭제되었습니다.");
  
    // 삭제 후 UI 갱신: 현재 friendUserId 제외
    setFriendsList(prev => prev.filter(friend => friend.id !== friendUserId));
  };

  return (
      <>
      {!loading &&
      <div className="bg-gray-100 h-[100vh] pt-10">
        <div className="max-w-[1024px] m-auto h-4/5 bg-white flex justify-between">
          
          <div className="flex flex-col border-r w-[15%]">
            <button className="mt-4" onClick={() => {setMenu("edit_info")}}>회원정보 변경</button>
            <button className="mt-4" onClick={() => {window.open('/plans', '_blank')}}>여행 일정 관리</button>
            <button className="mt-4" onClick={() => {setMenu("my_place")}}>찜 리스트</button>
            <button className="mt-4" onClick={() => {setMenu("my_review")}}>내가 쓴 리뷰</button>
            <button className="mt-4" onClick={() => {setMenu("edit_firends")}}>친구 관리</button>
          </div>
          
          <div className="w-full py-[5vh] px-[5vw]">
            {menu === "edit_info" && 
              <>
                <div className="text-[32px]">회원정보 변경</div>
                <div className="flex justify-between py-5 h-3/5">
                  <div className="text-center">
                    <div className="inline-block w-[140px] h-[140px] bg-gray-100 rounded-[50%] text-center overflow-hidden relative">
                      {profileUrl ? (<img src={profileUrl} alt="프로필 이미지" className="w-full h-full object-cover rounded-[20px]"/>
                      ) : (<span className="absolute text-gray-400 top-[50px] inset-0">등록된 사진이 <br />없습니다.</span>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        id="profile-upload"
                        style={{ display: 'none' }}
                        onChange={handleFileChange}
                        disabled={uploading}
                      />
                    </div>
                    <button 
                      className="text-gray-400 hover:text-gray-500" 
                      onClick={() => {
                        const elem = document.getElementById('profile-upload');
                        if (elem) {
                          elem.click();
                        }
                      }}
                      disabled={uploading}>사진 수정하기
                    </button>
                  </div>
                  <div className="w-full pr-10 ml-5 text-right">
                    <div className="mb-4">아이디(이메일) <input type="text" value={email} disabled className="px-2 py-1 ml-4 bg-gray-300 rounded-[10px]"/></div>
                    <div className="mb-4">이름 <input type="text" value={nickName} onChange={e => setNickName(e.target.value)} className="px-2 py-1 ml-4 bg-gray-100 rounded-[10px]"/></div>
                    <div className="mb-4">변경 비밀번호 <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} disabled={isSocialLogin} className={`px-2 py-1 ml-4 rounded-[10px] ${isSocialLogin ? "bg-gray-300" : "bg-gray-100"}`}/></div>
                    <div className="mb-4">비밀번호 재입력 <input type="password" value={newPasswordConfirm} onChange={e => setNewPasswordConfirm(e.target.value)} disabled={isSocialLogin} className={`px-2 py-1 ml-4 rounded-[10px] ${isSocialLogin ? "bg-gray-300" : "bg-gray-100"}`}/></div>
                    {isSocialLogin && (
                    <div className="mb-4 text-red-600"> 소셜 로그인 계정은 비밀번호를 변경할 수 없습니다.</div>
                    )}
                    <button className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-[10px]" onClick={handleUpdate}>수정</button>
                  </div>
                </div>
              </>
            }
            {menu === "my_place" && 
              <div className="text-[32px]">찜 리스트</div>
            }
            {menu === "my_review" && 
              <div className="text-[32px]">내가 쓴 리뷰</div>
            }
            {menu === "edit_firends" && 
              <div>
                <h2 className="mb-4 text-2xl">친구 목록</h2>
                <div>
                  {friendsList.length === 0 && <p>등록된 친구가 없습니다.</p>}
                  <ul className="max-h-[300px] bg-gray-100 overflow-auto">
                    {friendsList.map(friend => (
                      <li key={friend.id} className="flex items-center justify-between p-2 border-b-4 border-b-white">
                        <div>
                          <div><b>이름</b> {friend.nickname}</div>
                          <div><b>이메일</b> {friend.email}</div>
                        </div>
                        <div>
                          <button 
                          className="px-2 py-1 bg-white border rounded-[5px] hover:bg-gray-200"
                          onClick={() => handleDelete(friend.id)}
                          >삭제</button>
                        </div>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-2 text-right">
                    <button className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-[5px]" onClick={() => setModalOpen(true)}>추가</button>
                  </div>
                  <AddFriendModal isOpen={modalOpen} onClose={() => setModalOpen(false)} onSendRequest={handleSendFriendRequest} currentUserId={userId} friendIds={friendIds}/>
                </div>
              </div>
            }
          </div>
        </div>
      </div>
      }
      </>
  );
}