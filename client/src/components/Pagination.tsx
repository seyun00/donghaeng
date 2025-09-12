// /src/components/Pagination.tsx

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) {
    return null; 
  }
  
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  const viewPages = 5; // 한 번에 보여줄 페이지 버튼 개수
  

  const startPage = Math.floor((currentPage - 1) / viewPages) * viewPages + 1;
  const endPage = Math.min(startPage + viewPages - 1, totalPages);

  const pagesToDisplay = pages.slice(startPage - 1, endPage);

  // 버튼 스타일을 위한 클래스 정의
  const baseButtonClasses = "mx-1 px-4 py-2 rounded-lg transition-colors duration-200 ease-in-out";
  const activeButtonClasses = "bg-indigo-600 text-white font-bold shadow-md";
  const inactiveButtonClasses = "bg-gray-200 text-gray-700 hover:bg-gray-300";
  const arrowButtonClasses = "mx-1 px-3 py-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200";

  return (
    <div className="flex justify-center items-center my-8">
      {startPage > 1 && (
        <button 
          onClick={() => onPageChange(startPage - 1)}
          className={arrowButtonClasses}
        >
          &lt;
        </button>
      )}

      {/* 페이지 번호 버튼 */}
      {pagesToDisplay.map(page => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`${baseButtonClasses} ${currentPage === page ? activeButtonClasses : inactiveButtonClasses}`}
          disabled={page === currentPage}
        >
          {page}
        </button>
      ))}

      {/* 이동 버튼 */}
      {endPage < totalPages && (
        <button 
          onClick={() => onPageChange(endPage + 1)}
          className={arrowButtonClasses}
        >
          &gt;
        </button>
      )}
    </div>
  );
}