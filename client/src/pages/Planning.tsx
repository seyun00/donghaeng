import { Link } from "react-router-dom"

export default function Planning() {
  return (
    <> 
      <h1>여행 계획 페이지</h1>
      <Link to='/'>
        <button>홈으로</button>
      </Link>
    </>
  )
}