import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface ReviewPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

/**
 * A simplified pagination component for reviews
 * Designed to be compact for the review section in book details
 */
function ReviewPagination({ currentPage, totalPages, onPageChange }: ReviewPaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-center mt-4">
      <Pagination>
        <PaginationContent className="gap-1">
          <PaginationItem>
            <PaginationPrevious
              onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
              className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
            />
          </PaginationItem>

          {/* Display page numbers with limited range */}
          {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
            // Logic to determine which page numbers to show
            let pageNumber;
            if (totalPages <= 5) {
              // Show all pages if 5 or fewer
              pageNumber = i + 1;
            } else if (currentPage <= 3) {
              // Near the start
              pageNumber = i + 1;
            } else if (currentPage >= totalPages - 2) {
              // Near the end
              pageNumber = totalPages - 4 + i;
            } else {
              // In the middle
              pageNumber = currentPage - 2 + i;
            }

            return (
              <PaginationItem key={pageNumber}>
                <PaginationLink
                  isActive={currentPage === pageNumber}
                  onClick={() => onPageChange(pageNumber)}
                  className="h-8 w-8 p-0 flex items-center justify-center text-sm"
                >
                  {pageNumber}
                </PaginationLink>
              </PaginationItem>
            );
          })}

          <PaginationItem>
            <PaginationNext
              onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
              className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}

export default ReviewPagination;
