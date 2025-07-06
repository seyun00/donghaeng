import { useEffect, useState } from "react";
import { Link } from "react-router-dom"
import supabase from "../api/supabaseClient";
import useSession from "../hooks/useSesstion";

export default function Header() {
  
  const isLogin = useSession();

  const handleSignout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div style={{ borderBottom: '1px solid black', padding: '10px' }}>
      <Link to="/" style={{ marginRight: '30px', color: 'black', textDecoration: 'none' }}>동행</Link>
      {!isLogin ? (
        <>
          <Link to="/signin">
            <button>로그인</button>
          </Link>
          <Link to="/signup">
            <button>회원가입</button>
          </Link>
        </>
      ) : (
        <button onClick={handleSignout}>로그아웃</button>
      )}
    </div>
  );
}