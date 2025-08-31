import React, { useEffect, useState } from 'react';
import supabase from '../api/supabaseClient';

type MemberProfile = {
  user_id: string;
  nickname: string;
  profile_url?: string | null;
};

interface ManagePlanMembersModalProps {
  planId: string;
  open: boolean;
  onClose: () => void;
}

export default function PlanMembersList({
  planId,
  open,
  onClose,
}: ManagePlanMembersModalProps) {
  const [members, setMembers] = useState<MemberProfile[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    const fetchMembers = async () => {
      const { data, error } = await supabase
        .from('plan_members')
        .select('user_id, userinfo(nickname, profile_url)')
        .eq('plan_id', planId);
      if (!error && data) {
        setMembers(
          (data as any[]).map(m => ({
            user_id: m.user_id,
            nickname: m.userinfo?.nickname ?? '알수없음',
            profile_url: m.userinfo?.profile_url ?? null,
          }))
        );
      } else {
        setMembers([]);
      }
      setLoading(false);
    };
    fetchMembers();
  }, [open, planId]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg p-6 w-[350px] max-h-[80vh] overflow-y-auto">
        <h2 className="mb-4 text-xl font-bold">참여중인 멤버</h2>
        {loading ? (
          <p>불러오는 중...</p>
        ) : (
          <ul>
            {members.map(m => (
              <li key={m.user_id} className="flex items-center mb-3">
                {m.profile_url ? (
                  <img
                    src={m.profile_url}
                    className="w-8 h-8 mr-2 rounded-full"
                    alt="프로필"
                  />
                ) : (
                  <div className="w-8 h-8 mr-2 bg-gray-300 rounded-full" />
                )}
                <span>{m.nickname}</span>
              </li>
            ))}
          </ul>
        )}
        <div className="flex justify-end mt-4">
          <button className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300" onClick={onClose}>
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
