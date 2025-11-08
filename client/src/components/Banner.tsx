// /src/components/Banner.tsx

import { Link } from "react-router-dom";

export default function Banner() {
  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* 관광지 정보 배너 */}
      <div className="relative flex items-center justify-between p-8 bg-indigo-100 shadow-lg rounded-xl">
        <div className="flex items-center gap-4">
          {/* 아이콘 */}
          <img
            src="/icons/traver.png"
            alt="관광지 아이콘"
            className="w-16 h-16"
          />
          <div>
            <h2 className="mb-2 text-3xl font-bold text-indigo-800">국내 관광지 정보</h2>
            <p className="max-w-xl text-indigo-700">추천 관광지와 맛집 등 최신 정보를 한 곳에서 편리하게 확인하세요.</p>
          </div>
        </div>
        
        <Link to="/placeInformation">
          <button className="px-6 py-3 text-lg font-semibold text-white transition bg-indigo-600 rounded-md shadow-md hover:bg-indigo-700">
            관광지 정보 보기
          </button>
        </Link>
      </div>

      {/* 공유 코스 검색 배너 */}
      <div className="relative flex items-center justify-between p-8 bg-teal-100 shadow-lg rounded-xl">
        <div className="flex items-center gap-4">
          {/* 아이콘 */}
          <img
            src="/icons/share.png"
            alt="공유 코스 아이콘"
            className="w-16 h-16"
          />
          <div>
            <h2 className="mb-2 text-3xl font-bold text-teal-800">공유 코스 검색</h2>
            <p className="max-w-xl text-teal-700">다양한 사람들의 여행 코스를 검색하고 마음에 드는 코스를 찾아보세요.</p>
          </div>
        </div>

        <Link to="/searchSharedPlan">
          <button className="px-6 py-3 text-lg font-semibold text-white transition bg-teal-600 rounded-md shadow-md hover:bg-teal-700">
            공유 코스 검색하기
          </button>
        </Link>
      </div>

      <div className="relative flex items-center justify-between p-8 bg-rose-100 shadow-lg rounded-xl">
        <div className="flex items-center gap-4">
          <img
            src="/icons/recommend.png" 
            alt="관광지 추천 아이콘"
            className="w-16 h-16"
          />
          <div>
            <h2 className="mb-2 text-3xl font-bold text-rose-800">관광지 맞춤 추천</h2>
            <p className="max-w-xl text-rose-700">내가 원하는 관광지를 추천받아 보세요.</p>
          </div>
        </div>

        <Link to="/recommendation">
          <button className="px-6 py-3 text-lg font-semibold text-white transition bg-rose-600 rounded-md shadow-md hover:bg-rose-700">
            관광지 추천 받기
          </button>
        </Link>
      </div>
    </div>
  )
}