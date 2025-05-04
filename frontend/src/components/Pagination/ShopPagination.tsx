/* Shop Pagination Component - Paginated navigation for book listings */
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";

/* Props Interface */
interface ShopPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

/**
 * Advanced pagination component for the shop page
 * Includes first/last page, adjacent pages to current page, and ellipsis for skipped ranges
 */
function ShopPagination({
  currentPage,
  totalPages,
  onPageChange
}: ShopPaginationProps) {
  /* Don't render pagination if only one page */
  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-center mt-4">
      <Pagination>
        <PaginationContent>
          {/* Previous Page Button */}
          <PaginationItem>
            <PaginationPrevious
              onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
              className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
            />
          </PaginationItem>

          {/* First page */}
          <PaginationItem>
            <PaginationLink
              isActive={currentPage === 1}
              onClick={() => onPageChange(1)}
            >
              1
            </PaginationLink>
          </PaginationItem>

          {/* Left Ellipsis - Shown when current page is far from start */}
          {currentPage > 3 && (
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
          )}

          {/* Pages around current page */}
          {Array.from({ length: totalPages }).map((_, index) => {
            const pageNumber = index + 1;
            // Show current page and adjacent pages
            if (
              pageNumber !== 1 &&
              pageNumber !== totalPages &&
              pageNumber >= currentPage - 1 &&
              pageNumber <= currentPage + 1
            ) {
              return (
                <PaginationItem key={pageNumber}>
                  <PaginationLink
                    isActive={currentPage === pageNumber}
                    onClick={() => onPageChange(pageNumber)}
                  >
                    {pageNumber}
                  </PaginationLink>
                </PaginationItem>
              );
            }
            return null;
          })}

          {/* Right Ellipsis - Shown when current page is far from end */}
          {currentPage < totalPages - 2 && (
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
          )}

          {/* Last page (if more than 1 page) */}
          {totalPages > 1 && (
            <PaginationItem>
              <PaginationLink
                isActive={currentPage === totalPages}
                onClick={() => onPageChange(totalPages)}
              >
                {totalPages}
              </PaginationLink>
            </PaginationItem>
          )}

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

export default ShopPagination;
