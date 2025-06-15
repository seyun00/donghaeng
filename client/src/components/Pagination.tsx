interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  const viewPages = 5; // 한 세트당 보여줄 페이지 개수
  const totalPageSets = Math.ceil((totalPages)/viewPages); // 전체 페이지 세트 개수

  const firstPage = Math.floor((currentPage-1)/viewPages)*viewPages+1; // 현재 페이지 세트의 첫 번째 페이지

  return (
    <div>

      {firstPage != 1 &&
        <button onClick={() => onPageChange(firstPage-viewPages)}>
          &lt;
        </button>
      }

      {pages.slice(firstPage-1,firstPage-1 +viewPages).map(page => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          disabled={page === currentPage}
        >
          {page}
        </button>
      ))}

      {firstPage != (totalPageSets-1)*viewPages+1 &&
        <button onClick={() => onPageChange(firstPage+viewPages)}>
          &gt;
        </button>
      }

      <p>전체 페이지 : {pages.length}</p>
      {/* <p>현재 페이지 : {currentPage}</p> */}
      {/* <p>첫번째 페이지 : {firstPage}</p> */}
      {/* <p>페이지 세트 개수 : {totalPageSets}</p> */}

    </div>
    
  );
}
