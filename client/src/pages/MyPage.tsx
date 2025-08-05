import { useEffect, useRef, useState } from "react";
import supabase from "../api/supabaseClient";
import { useNavigate } from "react-router-dom";
export default function MyPage () {
  const [menu, setMenu] = useState<String>("edit_info");
  
  const [userId, setUserId] = useState<String>("");
  const [nickName, setNickName] = useState("");
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
      setEmail(userData.email);
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
                <div className="flex justify-between p-5 h-3/5">
                  <div className="text-center">
                    <div className="inline-block w-[140px] h-[140px] bg-gray-100 rounded-[50%] text-center overflow-hidden relative">
                      {profileUrl ? (<img src={profileUrl} alt="프로필 이미지" className="w-full h-full object-cover rounded-[20px]"/>
                      ) : (<span className="absolute text-gray-400 top-[60px] inset-0">이미지 없음</span>
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
                      disabled={uploading}>프로필 사진 수정
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
              <div className="text-[32px]">친구 관리</div>
            }
          </div>
          
        </div>
      </div>
      }
      </>
  );
}