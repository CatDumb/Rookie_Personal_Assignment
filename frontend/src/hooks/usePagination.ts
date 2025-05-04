/* Pagination Hook - Handles pagination logic and state management */
import { useState, useEffect, useCallback } from 'react';

/* Configuration Options Interface */
interface PaginationOptions {
    initialPage?: number;
    totalItems: number;
    itemsPerPage: number;
    maxPagesToShow?: number;
}

/**
 * Custom hook for handling pagination calculations and state
 * @param options Configuration options for pagination
 * @returns Object with pagination state and control functions
 */
export function usePagination({
    initialPage = 1,
    totalItems,
    itemsPerPage,
    maxPagesToShow = 5
}: PaginationOptions) {
    /* Basic State */
    const [currentPage, setCurrentPage] = useState(initialPage);

    /* Derived Calculations */
    // Calculate total number of pages
    const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

    // Calculate indexes for displaying items
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage - 1, totalItems - 1);

    /* Page Navigation Handlers */
    // Go to specific page with validation
    const goToPage = useCallback((page: number) => {
        const validPage = Math.max(1, Math.min(page, totalPages));
        setCurrentPage(validPage);
    }, [totalPages]);

    // Go to next page
    const nextPage = useCallback(() => {
        if (currentPage < totalPages) {
            setCurrentPage(prev => prev + 1);
        }
    }, [currentPage, totalPages]);

    // Go to previous page
    const prevPage = useCallback(() => {
        if (currentPage > 1) {
            setCurrentPage(prev => prev - 1);
        }
    }, [currentPage]);

    /* Page Number Generation for UI */
    // Generate array of page numbers to display
    const getPageNumbers = useCallback(() => {
        if (totalPages <= maxPagesToShow) {
            return Array.from({ length: totalPages }, (_, i) => i + 1);
        }

        // Complex logic for showing limited page numbers with ellipsis
        const leftSiblingIndex = Math.max(currentPage - 1, 1);
        const rightSiblingIndex = Math.min(currentPage + 1, totalPages);

        const shouldShowLeftDots = leftSiblingIndex > 2;
        const shouldShowRightDots = rightSiblingIndex < totalPages - 1;

        if (!shouldShowLeftDots && shouldShowRightDots) {
            // Show more pages at beginning
            const leftItemCount = 3 + (maxPagesToShow - 5);
            const leftRange = Array.from({ length: leftItemCount }, (_, i) => i + 1);
            return [...leftRange, -1, totalPages];
        }

        if (shouldShowLeftDots && !shouldShowRightDots) {
            // Show more pages at end
            const rightItemCount = 3 + (maxPagesToShow - 5);
            const rightRange = Array.from(
                { length: rightItemCount },
                (_, i) => totalPages - rightItemCount + i + 1
            );
            return [1, -1, ...rightRange];
        }

        if (shouldShowLeftDots && shouldShowRightDots) {
            // Show pages around current
            const middleRange = [leftSiblingIndex, currentPage, rightSiblingIndex];
            return [1, -1, ...middleRange, -1, totalPages];
        }

        return [];
    }, [currentPage, totalPages, maxPagesToShow]);

    /* Reset to First Page When Total Changes */
    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(1);
        }
    }, [totalPages, currentPage]);

    /* Return Values and Functions */
    return {
        currentPage,
        totalPages,
        startIndex,
        endIndex,
        pageNumbers: getPageNumbers(),
        goToPage,
        nextPage,
        prevPage,
        hasNextPage: currentPage < totalPages,
        hasPrevPage: currentPage > 1
    };
}
