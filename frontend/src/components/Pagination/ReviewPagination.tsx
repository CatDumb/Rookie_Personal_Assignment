/* Review Pagination Component - Compact pagination for review listings */
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

/* Props Interface */
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
  /* Don't render pagination if only one page exists */
  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-center mt-4">
      <Pagination>
        <PaginationContent className="gap-1">
          {/* Previous Page Button */}
          <PaginationItem>
            <PaginationPrevious
              onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
              className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
            />
          </PaginationItem>

          {/* Dynamic Page Numbers - Shows 5 pages max with shifting window */}
          {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
            // Logic to determine which page numbers to show
            let pageNumber;
            if (totalPages <= 5) {
              // Case 1: Show all pages if 5 or fewer
              pageNumber = i + 1;
            } else if (currentPage <= 3) {
              // Case 2: Near the start - show first 5 pages
              pageNumber = i + 1;
            } else if (currentPage >= totalPages - 2) {
              // Case 3: Near the end - show last 5 pages
              pageNumber = totalPages - 4 + i;
            } else {
              // Case 4: In the middle - show current page and 2 on each side
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

          {/* Next Page Button */}
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
