import React, { useEffect, useState, useRef } from 'react';
import supabase from '../api/supabaseClient';

type MemberProfile = {
  user_id: string;
  nickname: string;
  profile_url?: string | null;
};

interface ChattingProps {
  planId: string;
  user: MemberProfile;
}

type ChatMessage = {
  id: number;
  plan_id: string;
  user_id: string;
  message: string;
  created_at: string;
};

export default function Chatting({ planId, user }: ChattingProps) {
  const [members, setMembers] = useState<MemberProfile[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const messagesRef = useRef<HTMLDivElement | null>(null);

  // 참여자 목록 불러오기
useEffect(() => {
  const loadMembers = async () => {
    const { data, error } = await supabase
      .from('plan_members')
      .select('user_id, userinfo(nickname, profile_url)')
      .eq('plan_id', planId);
    setMembers(
      (data ?? []).map(m => {
        const info = m.userinfo as { nickname?: string; profile_url?: string };
        return {
          user_id: m.user_id,
          nickname: info?.nickname ?? '알수없음',
          profile_url: info?.profile_url ?? null,
        };
      })
    );
  };
  loadMembers();
}, [planId]);

// 메시지 불러오기 및 실시간 구독
  useEffect(() => {
    const loadMessages = async () => {
      const { data } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('plan_id', planId)
        .order('created_at');
      setMessages((data ?? []) as ChatMessage[]);
    };
    loadMessages();

    const channel = supabase
      .channel(`chat_messages-${planId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `plan_id=eq.${planId}`,
        },
        (payload) => {
          setMessages((current) => [...current, payload.new as ChatMessage]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [planId]);

   // 자동 스크롤
  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages]);

  // 입력폼 변화 핸들러
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  // 메시지 전송
  const handleSend = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim()) return;
    await supabase
      .from('chat_messages')
      .insert([
        {
          plan_id: planId,
          user_id: user.user_id,
          message: input.trim(),
        },
      ]);
    setInput('');
  };

  // 해당 유저의 프로필 찾기 (user_id로 비교)
  const getProfile = (userId: string) => members.find(m => m.user_id === userId);
  
  // 렌더링
  return (
  <div className="flex flex-col h-full" style={{ height: '100%' }}>
    {/* 채팅 메시지 목록 */}
    <div
      ref={messagesRef}
      className="flex-1 w-full p-2 overflow-y-auto border-2"
      style={{ height: '80%', minHeight: 0 }}
    >
      {messages.map(msg => {
        const profile = getProfile(msg.user_id);
        const isCurrentUser = msg.user_id === user.user_id;
        return (
          <div key={msg.id} className={`py-2`}>
            {!isCurrentUser ? (
              <>
                <div className='flex items-center mb-1'>
                  {profile?.profile_url ? (
                    <img
                      src={profile.profile_url}
                      alt=""
                      className="inline object-cover w-6 h-6 rounded-full"
                    />
                  ) : (
                    <div className="inline-block w-6 h-6 bg-gray-300 rounded-full" />
                  )}
                  <div className="ml-1 font-bold">{profile?.nickname || '알수없음'}</div>
                </div>
                <div className='flex justify-start'>
                  <span className='px-2 py-1 bg-gray-200 rounded-[10px] break-words max-w-full'>{msg.message}</span>
                </div>
              </>
            ) : <div className='flex justify-end'>
              <span className='px-2 py-1 bg-blue-200 rounded-[10px] break-words max-w-full'>{msg.message}</span>
              </div>
            }
            
          </div>
        );
      })}
    </div>
    {/* 입력 폼 */}
    <form
      onSubmit={handleSend}
      className="flex items-center gap-2 p-2 border-2"
      style={{ height: '20%' }}
    >
      <input
        type="text"
        value={input}
        onChange={handleInputChange}
        className="flex-1 p-2 border"
        placeholder="메시지를 입력하세요"
      />
      <button type="submit" className="px-4 py-2 text-white bg-blue-500 rounded">
        전송
      </button>
    </form>
  </div>
  );
}
