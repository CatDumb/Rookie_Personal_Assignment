interface FilterState {
  categories: number[];
  authors: number[];
  ratings: number[];
}

interface ShopHeaderProps {
  activeFilters?: FilterState;
  categoryNames?: Map<number, string>;
  authorNames?: Map<number, string>;
}

export const ShopHeader = ({ activeFilters, categoryNames, authorNames }: ShopHeaderProps) => {
    const hasFilters = activeFilters && (
        activeFilters.categories.length > 0 ||
        activeFilters.authors.length > 0 ||
        activeFilters.ratings.length > 0
    );

    const buildFilterString = () => {
        if (!activeFilters || !hasFilters) return "";

        const parts = [];

        if (activeFilters.categories.length > 0) {
            const names = activeFilters.categories
                .map(id => categoryNames?.get(id) || `Category ${id}`)
                .join(', ');
            parts.push(`category(s): ${names}`);
        }

        if (activeFilters.authors.length > 0) {
            const names = activeFilters.authors
                .map(id => authorNames?.get(id) || `Author ${id}`)
                .join(', ');
            parts.push(`author(s): ${names}`);
        }

        if (activeFilters.ratings.length > 0) {
            const rating = activeFilters.ratings[0];
            parts.push(`rating: ${rating} ${rating === 1 ? 'star' : 'stars'}`);
        }

        // Join the parts with commas and 'and' before the last part
        let filterText = "";
        if (parts.length === 1) {
            filterText = parts[0];
        } else if (parts.length === 2) {
            filterText = parts.join(' and ');
        } else if (parts.length > 2) {
            filterText = parts.slice(0, -1).join(', ') + ', and ' + parts[parts.length - 1];
        }

        return `(Filtered by ${filterText})`;
    };

    return (
        <div className="header">
            <div className="font-bold my-4 text-2xl">
                <div className="flex items-center gap-3">
                    <h3>Book</h3>
                    {hasFilters && (
                        <span className="text-sm font-light text-gray-600">
                            {buildFilterString()}
                        </span>
                    )}
                </div>
            </div>
            <hr></hr>
        </div>
    );
};
