import { useEffect, useRef, useState } from "react";

const carouselItems = [
  {
    image: "/assets/mainCarousel1.jpg",
    title: "함께 만드는 여행 계획",
    desc: "여러 명이 쉽고 편하게 여행 일정을 수정, 공유할 수 있습니다.",
  },
  {
    image: "/assets/mainCarousel2.jpg",
    title: "국내 여행지 정보",
    desc: "추천 관광지와 맛집 등 최신 정보를 한 곳에서 확인하세요.",
  },
  {
    image: "/assets/mainCarousel3.jpg",
    title: "여행 코스 공유",
    desc: "국내 여행 일정 추천부터 코스 공유 기능까지 제공합니다.",
  },
];

// 인디케이터 표시를 실제 슬라이드 인덱스로 변환
const getIndicatorIndex = (idx: number, length: number) => {
  if (idx === 0) return length - 1; // 가짜 마지막 → 실제 마지막
  if (idx === length + 1) return 0; // 가짜 첫번째 → 실제 첫번째
  return idx - 1;
};

export default function Carousel() {
  const length = carouselItems.length;
  // 클론 슬라이드 포함 전체 슬라이드 배열
  const itemList = [
    carouselItems[length - 1], // 가짜 마지막 슬라이드
    ...carouselItems,
    carouselItems[0], // 가짜 첫번째 슬라이드
  ];

  const [idx, setIdx] = useState(1); // 실제 첫 슬라이드부터 시작
  const [anim, setAnim] = useState(true); // 애니메이션 활성화여부
  const transitionRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // 슬라이드 이동 함수
  const slideTo = (newIdx: number) => {
    setIdx(newIdx);
    setAnim(true);
  };

  // 자동 슬라이드 타이머 시작 함수 (기존 타이머 초기화 포함)
  const startTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    timerRef.current = setInterval(() => {
      setIdx((prev) => prev + 1);
      setAnim(true);
    }, 5000);
  };

  // 탭 활성 상태에 따른 타이머 시작/중지 처리
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        startTimer();
      } else {
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // 초기 시작
    if (document.visibilityState === "visible") {
      startTimer();
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  // 무한 루프용 인덱스 점프 처리 (transition 끝났을 때)
  useEffect(() => {
    if (!transitionRef.current) return;

    const handleTransitionEnd = () => {
      if (idx === itemList.length - 1) {
        setAnim(false);
        setIdx(1); // 실제 첫번째 슬라이드로 점프
      } else if (idx === 0) {
        setAnim(false);
        setIdx(itemList.length - 2); // 실제 마지막 슬라이드로 점프
      }
    };

    const el = transitionRef.current;
    el.addEventListener("transitionend", handleTransitionEnd);

    return () => {
      el.removeEventListener("transitionend", handleTransitionEnd);
    };
  }, [idx, itemList.length]);

  // 인디케이터 클릭 시 슬라이드 이동 및 타이머 재시작
  const goTo = (slideIdx: number) => {
    slideTo(slideIdx + 1);
    startTimer(); // 클릭 시 타이머 초기화 및 재시작
  };

  return (
    <div className="relative w-full max-w-5xl mx-auto mb-12 overflow-hidden rounded-xl">
      <div
        ref={transitionRef}
        className={`flex ${anim ? "transition-transform duration-700" : ""}`}
        style={{ transform: `translateX(-${idx * 100}%)` }}
      >
        {itemList.map((item, i) => (
          <div
            key={i}
            className="relative flex-shrink-0 w-full h-64 sm:h-80 md:h-96"
          >
            <img
              src={item.image}
              alt={item.title}
              className="object-cover w-full h-full rounded-md"
            />
            <div className="absolute bottom-0 left-0 w-full px-6 py-4 text-white bg-gradient-to-t from-black/70 to-transparent rounded-b-md">
              <h3 className="text-xl font-bold">{item.title}</h3>
              <p className="mt-1 text-sm">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* 인디케이터 */}
      <div className="absolute z-10 flex gap-2 -translate-x-1/2 left-1/2 bottom-4">
        {carouselItems.map((_, i) => {
          const indicatorIdx = getIndicatorIndex(idx, length);
          return (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`w-3 h-3 rounded-full ${
                i === indicatorIdx ? "bg-indigo-500" : "bg-gray-300"
              }`}
            />
          );
        })}
      </div>
    </div>
  );
}
