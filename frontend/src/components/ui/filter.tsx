import { useState, useEffect } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { getCategories, Category } from "@/api/category";
import { getAuthors, Author } from "@/api/author";
import { ScrollArea } from "@/components/ui/scroll-area";


interface BookFiltersProps {
    onFilterChange?: (filters: FilterState) => void;
}

// At the top of the file
export interface FilterState {
    categories: number[];
    authors: number[];
    ratings: number[];
}

export const BookFilters = ({ onFilterChange }: BookFiltersProps) => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [authors, setAuthors] = useState<Author[]>([]);
    const [categoriesLoading, setCategoriesLoading] = useState(true);
    const [authorsLoading, setAuthorsLoading] = useState(true);
    const [categoriesError, setCategoriesError] = useState("");
    const [authorsError, setAuthorsError] = useState("");
    const [selectedFilters, setSelectedFilters] = useState<FilterState>({
        categories: [],
        authors: [],
        ratings: []
    });

    const handleCategoryClick = (categoryId: number) => {
        setSelectedFilters((prev) => {
            const newCategories = prev.categories.includes(categoryId)
                ? prev.categories.filter((id) => id !== categoryId)  // Remove if already selected
                : [...prev.categories, categoryId];                // Add if not selected

            const newFilters = { ...prev, categories: newCategories };

            // Notify parent component
            if (onFilterChange) {
                onFilterChange(newFilters);
            }

            return newFilters;
        });
    };

    const handleAuthorClick = (authorId: number) => {
        setSelectedFilters((prev) => {
            const newAuthors = prev.authors.includes(authorId)
                ? prev.authors.filter((id) => id !== authorId)  // Remove if already selected
                : [...prev.authors, authorId];                // Add if not selected

            const newFilters = { ...prev, authors: newAuthors };

            // Notify parent component
            if (onFilterChange) {
                onFilterChange(newFilters);
            }

            return newFilters;
        });
    };

    const handleRatingClick = (rating: number) => {
        setSelectedFilters((prev) => {
            // If this rating is already selected, remove it (deselect)
            // Otherwise, replace any existing rating with this one
            const newRatings = prev.ratings.includes(rating)
                ? []  // Deselect if clicking the same rating
                : [rating];  // Select only this rating

            const newFilters = { ...prev, ratings: newRatings };

            // Notify parent component
            if (onFilterChange) {
                onFilterChange(newFilters);
            }

            return newFilters;
        });
    };

    useEffect(() => {
        // Fetch categories
        setCategoriesLoading(true);
        setCategoriesError("");
        getCategories()
            .then((data) => {
                // Sort categories alphabetically by name
                const sortedCategories = [...data].sort((a, b) =>
                    a.category_name.localeCompare(b.category_name)
                );
                setCategories(sortedCategories);
                setCategoriesLoading(false);
            })
            .catch((err) => {
                console.error("Error fetching categories:", err);
                setCategoriesError("Failed to load categories");
                setCategoriesLoading(false);
            });

        // Fetch authors
        setAuthorsLoading(true);
        setAuthorsError("");
        getAuthors()
            .then((data) => {
                // Sort authors alphabetically by name
                const sortedAuthors = [...data].sort((a, b) =>
                    a.author_name.localeCompare(b.author_name)
                );
                setAuthors(sortedAuthors);
                setAuthorsLoading(false);
            })
            .catch((err) => {
                console.error("Error fetching authors:", err);
                setAuthorsError("Failed to load authors");
                setAuthorsLoading(false);
            });
    }, []);

    return (
        <div className="flex flex-col gap-4 font-bold text-xl">
            Filter By
            <Accordion type="multiple" className="w-full">
                <AccordionItem value="item-1" className="border border-gray-300 rounded-md mb-2">
                    <AccordionTrigger className="p-2">Category</AccordionTrigger>
                    <AccordionContent>
                        {categoriesLoading ? (
                            <div className="text-sm font-normal">Loading categories...</div>
                        ) : categoriesError ? (
                            <div className="text-sm font-normal text-red-500">{categoriesError}</div>
                        ) : categories.length === 0 ? (
                            <div className="text-sm font-normal">No categories available</div>
                        ) : (
                            <ScrollArea className="h-40">
                                <div className="space-y-1 pr-3">
                                    {categories.map((category) => (
                                        <div
                                            className={`px-4 py-2 font-normal hover:bg-gray-100 cursor-pointer rounded transition-colors
                                                ${selectedFilters.categories.includes(category.id)
                                                    ? "bg-blue-50 text-blue-700 font-medium"
                                                    : ""}`}
                                            key={category.id}
                                            onClick={() => handleCategoryClick(category.id)}
                                        >
                                            {category.category_name}
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        )}
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2" className="border border-gray-300 rounded-md mb-2">
                    <AccordionTrigger className="p-2">Author</AccordionTrigger>
                    <AccordionContent>
                        {authorsLoading ? (
                            <div className="text-sm font-normal">Loading authors...</div>
                        ) : authorsError ? (
                            <div className="text-sm font-normal text-red-500">{authorsError}</div>
                        ) : authors.length === 0 ? (
                            <div className="text-sm font-normal">No authors available</div>
                        ) : (
                            <ScrollArea className="h-40">
                                <div className="space-y-1 pr-3">
                                    {authors.map((author) => (
                                        <div
                                            className={`px-4 py-2 font-normal hover:bg-gray-100 cursor-pointer rounded transition-colors
                                                ${selectedFilters.authors.includes(author.id)
                                                    ? "bg-blue-50 text-blue-700 font-medium"
                                                    : ""}`}
                                            key={author.id}
                                            onClick={() => handleAuthorClick(author.id)}
                                        >
                                            {author.author_name}
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        )}
                    </AccordionContent>
                </AccordionItem>
                {/* Rating section remains the same */}
                <AccordionItem value="item-3" className="border border-gray-300 rounded-md mb-2 relative">
                    <AccordionTrigger className="p-2">Rating</AccordionTrigger>
                    <AccordionContent>
                        <div className="space-y-1">
                            {[5, 4, 3, 2, 1].map((rating) => (
                                <div
                                    className={`px-4 py-2 font-normal hover:bg-gray-100 cursor-pointer rounded transition-colors
                                        ${selectedFilters.ratings.includes(rating)
                                            ? "bg-blue-50 text-blue-700 font-medium"
                                            : ""}`}
                                    key={rating}
                                    onClick={() => handleRatingClick(rating)}
                                >
                                    {rating} {rating === 1 ? "Star" : "Stars"}
                                </div>
                            ))}
                        </div>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </div>
    );
};
