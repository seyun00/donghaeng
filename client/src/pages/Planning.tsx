import { Link } from "react-router-dom"
import { useEffect, useRef } from 'react';

export default function Planning() {
  const mapRef = useRef(null);
  useEffect(() => {
    const { naver } = window;
    if (mapRef.current && naver) {
      const location = new naver.maps.LatLng(37.5665, 126.9780); // 예시: 서울시청
      const mapOptions = {
        center: location,
        zoom: 15,
        zoomControl: true,
      };
      const map = new naver.maps.Map(mapRef.current, mapOptions);

      // 마커 추가 예시
      new naver.maps.Marker({
        position: location,
        map,
      });
    }
  }, []);
  return (
    <> 
      <h1>여행 계획 페이지</h1>
      <Link to='/'>
        <button>홈으로</button>
      </Link>
      <div
      ref={mapRef}
      style={{ width: '100%', height: '400px' }}
    />
    </>
  )
}