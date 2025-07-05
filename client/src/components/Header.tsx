import { Link } from "react-router-dom"

export default function Header() {
  return(
    <>
    <div style={{ borderBottom: '1px solid black', padding:'10px' }}>
      <span style={{marginRight:'30px'}}>헤더 부분</span>
      
      <Link to="/signin">
      <button>로그인</button>
      </Link>
      
      <Link to="/signup">
      <button>회원가입</button>
      </Link>

    </div>
    </>
  )
}