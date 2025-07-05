export default function Header() {
  return(
    <>
    <div style={{ 
      borderBottom: '1px solid black',
      padding:'10px'
    }}>
      <span style={{marginRight:'30px'}}>헤더 부분</span>
      <button>로그인</button>
      <button>회원가입</button>
    </div>
    </>
  )
}