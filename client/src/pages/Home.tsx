import { Link } from "react-router-dom"

export default function Home() {
  return (
    <>
      <h1>메인 페이지</h1>
      <Link to="/planning">
        <button>여행 계획 페이지</button>
      </Link>
      
      <Link to="/placeInformation">
        <button>관광지 정보 페이지</button>
      </Link>
    </>
  )
}