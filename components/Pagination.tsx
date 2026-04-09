import { ChevronLeft, ChevronRight } from "lucide-react";

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
  onGo: (page: number) => void;
};

export function Pagination({
  currentPage,
  totalPages,
  onPrev,
  onNext,
  onGo,
}: PaginationProps) {
  return (
    <div className="flex items-center justify-center gap-3 mt-8 mb-4">
      <button
        onClick={onPrev}
        disabled={currentPage === 1}
        className="w-9 h-9 rounded-xl flex items-center justify-center bg-white border border-stone-200 text-stone-500 hover:bg-amber-50 hover:border-amber-300 hover:text-amber-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-150 shadow-sm"
      >
        <ChevronLeft size={16} />
      </button>

      <div className="flex items-center gap-1.5">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            onClick={() => onGo(page)}
            className={`w-8 h-8 rounded-lg text-xs font-medium transition-all duration-150 ${
              page === currentPage
                ? "bg-amber-400 text-white shadow-md shadow-amber-200"
                : "bg-white border cursor-pointer border-stone-200 text-stone-500 hover:bg-amber-50 hover:border-amber-200 hover:text-amber-600"
            }`}
          >
            {page}
          </button>
        ))}
      </div>

      <button
        onClick={onNext}
        disabled={currentPage === totalPages}
        className="w-9 h-9 rounded-xl flex items-center justify-center bg-white border border-stone-200 text-stone-500 hover:bg-amber-50 hover:border-amber-300 hover:text-amber-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-150 shadow-sm"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}

