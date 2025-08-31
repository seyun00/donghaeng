import React, { useState, useEffect } from "react";
import supabase from "../api/supabaseClient";

type MemberProfile = {
  user_id: string;
  nickname: string;
  profile_url?: string | null;
};

interface AddFriendsToPlanningProps {
  currentUserId: string;
  planId: string;
  open: boolean;
  onClose: () => void;
  onAdded?: (addedId: string) => void;
}

export default function AddFriendsToPlanning({
  currentUserId,
  planId,
  open,
  onClose,
  onAdded,
}: AddFriendsToPlanningProps) {
  const [friends, setFriends] = useState<MemberProfile[]>([]);
  const [planMemberIds, setPlanMemberIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [inviting, setInviting] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const fetchFriendsAndMembers = async () => {
      setLoading(true);

      // 1) friend_details에서 친구 id만 조회 (필수 컬럼만)
      const { data: friendsData, error: friendsError } = await supabase
        .from('friend_details')
        .select('requester_id, addressee_id')
        .or(`requester_id.eq.${currentUserId},addressee_id.eq.${currentUserId}`)
        .eq('status', 'accepted');

      if (friendsError || !friendsData) {
        setFriends([]);
        setLoading(false);
        return;
      }

      // 2) 친구 id 배열 생성 (내 기준 상대방 id만)
      const friendIds = friendsData.map(f =>
        f.requester_id === currentUserId ? f.addressee_id : f.requester_id
      );

      if (friendIds.length === 0) {
        setFriends([]);
        setLoading(false);
        return;
      }

      // 3) userinfo에서 해당 친구들 프로필 및 닉네임 조회
      const { data: userinfoData, error: userInfoError } = await supabase
        .from('userinfo')
        .select('id, nickname, profile_url')
        .in('id', friendIds);
          
      if (userInfoError || !userinfoData) {
        setFriends([]);
        setLoading(false);
        return;
      }

      // 4) userinfoData 그대로 상태에 반영 (MemberProfile 타입과 일치)
      setFriends(
        (userinfoData as any[]).map((u) => ({
          user_id: u.id,
          nickname: u.nickname,
          profile_url: u.profile_url,
        }))
      );

      // 5) 현재 플랜 멤버 아이디도 불러오기 (기존과 동일)
      const { data: membersData, error: membersError } = await supabase
        .from('plan_members')
        .select('user_id')
        .eq('plan_id', planId);

      if (!membersError && membersData) {
        setPlanMemberIds(membersData.map((m: any) => m.user_id));
      } else {
        setPlanMemberIds([]);
      }

      setLoading(false);
    };
    fetchFriendsAndMembers();
  }, [open, currentUserId, planId]);

  const handleInvite = async (friendId: string) => {
    if (planMemberIds.includes(friendId)) return;
    setInviting(friendId);
    const { error } = await supabase
      .from('plan_members')
      .insert({ plan_id: planId, user_id: friendId });
    setInviting(null);
    if (error) {
      alert("친구 초대 오류: " + error.message);
      return;
    }
    if (onAdded) onAdded(friendId);
    setPlanMemberIds((prev) => [...prev, friendId]);
    alert("친구가 성공적으로 초대되었습니다!");
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg p-6 w-[400px] max-h-[70vh] overflow-y-auto">
        <h2 className="mb-4 text-xl font-bold">친구 초대하기</h2>
        {loading ? (
          <p>불러오는 중...</p>
        ) : (
          <ul>
            {friends.map((friend) => (
              <li
                key={friend.user_id}
                className={`flex items-center p-2 ${
                  planMemberIds.includes(friend.user_id) ? "opacity-50" : ""
                }`}
              >
                {friend.profile_url ? (
                  <img
                    src={friend.profile_url}
                    alt=""
                    className="object-cover w-8 h-8 mr-2 rounded-full"
                  />
                ) : (
                  <div className="w-8 h-8 mr-2 bg-gray-300 rounded-full" />
                )}
                <span className="flex-1">{friend.nickname}</span>
                {planMemberIds.includes(friend.user_id) ? (
                  <span className="mr-2 text-sm text-gray-500">참여중</span>
                ) : (
                  <button
                    onClick={() => handleInvite(friend.user_id)}
                    disabled={inviting === friend.user_id}
                    className="px-3 py-1 text-white bg-blue-500 rounded hover:bg-blue-600"
                  >
                    {inviting === friend.user_id ? "초대중..." : "초대"}
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
        <div className="flex justify-end gap-2 mt-4">
          <button className="px-3 py-1 mr-2 bg-gray-200 rounded hover:bg-gray-300" onClick={onClose}>
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
