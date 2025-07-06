// 로그인 상태 확인 로직
import { useEffect, useState } from "react";
import supabase from "../api/supabaseClient";

export default function useSession() {
  const [isLogin, setIsLogin] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsLogin(!!session);
    };

    checkSession();

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      setIsLogin(!!session);
    });

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  return isLogin;
}