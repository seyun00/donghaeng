import { Link } from "react-router-dom"

export default function PlaceInformation() {
  return (
    <>
      <h1>관광지 정보 페이지</h1>
      <Link to='/'>
        <button>홈으로</button>
      </Link>
    </>
  )
}