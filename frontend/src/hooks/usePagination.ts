import { useState, useMemo, useCallback, useEffect } from 'react';

interface UsePaginationProps<T> {
  data: T[];
  itemsPerPage: number;
  initialPage?: number;
}

export const usePagination = <T,>({
  data,
  itemsPerPage,
  initialPage = 1
}: UsePaginationProps<T>) => {

  const [currentPage, setCurrentPage] = useState<number>(initialPage);

  // Memoize calculations to avoid recomputing on every render
  const totalPages = useMemo(() => Math.ceil(data.length / itemsPerPage), [data.length, itemsPerPage]);

  const paginatedData = useMemo(() => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return data.slice(indexOfFirstItem, indexOfLastItem);
  }, [data, currentPage, itemsPerPage]);

  // Ensure currentPage stays within valid bounds
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages); // Go to last page if current page becomes invalid
    } else if (currentPage < 1 && data.length > 0) {
        setCurrentPage(1); // Go to first page if current page is invalid
    }
  }, [currentPage, totalPages, data.length]);

  // Handlers are memoized using useCallback
  const handlePageChange = useCallback((page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  }, [totalPages]);

  const nextPage = useCallback(() => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  }, [totalPages]);

  const prevPage = useCallback(() => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  }, []);

  return {
    currentPage,
    totalPages,
    paginatedData,
    handlePageChange,
    setCurrentPage, // Expose setter if direct page setting is needed
    nextPage,
    prevPage
  };
};
