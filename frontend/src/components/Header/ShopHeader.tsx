interface FilterState {
  categories: number[];
  authors: number[];
  ratings: number[];
}

interface ShopHeaderProps {
  activeFilters?: FilterState;
}

export const ShopHeader = ({ activeFilters }: ShopHeaderProps) => {
    const hasFilters = activeFilters && (
        activeFilters.categories.length > 0 ||
        activeFilters.authors.length > 0 ||
        activeFilters.ratings.length > 0
    );

    return (
        <div className="header">
            <div className="font-bold my-4 text-2xl">
                <div className="flex items-center gap-3">
                    <h3>Book</h3>
                    {hasFilters && (
                        <span className="text-sm font-light text-gray-600">
                            {`(Filtered by `}
                            {activeFilters?.categories.length > 0 &&
                                `${activeFilters.categories.length} categories`}
                            {activeFilters?.categories.length > 0 &&
                             activeFilters?.authors.length > 0 && ', '}
                            {activeFilters?.authors.length > 0 &&
                                `${activeFilters.authors.length} authors`}
                            {(activeFilters?.categories.length > 0 ||
                              activeFilters?.authors.length > 0) &&
                             activeFilters?.ratings.length > 0 && ', '}
                            {activeFilters?.ratings.length > 0 &&
                                `${activeFilters.ratings[0]}-stars rating`}
                            {`)`}
                        </span>
                    )}
                </div>
            </div>
            <hr></hr>
        </div>
    );
};
