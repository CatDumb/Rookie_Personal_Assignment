/* Book Carousel Component - Displays books on sale in a scrollable carousel */
import { useState, useEffect } from "react";
import { BookCard } from "../ui/card";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "../ui/carousel";
import { getOnSale, OnSaleItem } from "../../api/book";

const CarouselBar = () => {
    /* State Management */
    const [saleBooks, setSaleBooks] = useState<OnSaleItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    /* Data Fetching - Load books with sales/discounts */
    useEffect(() => {
        setLoading(true);
        setError("");

        getOnSale()
            .then((books) => {
                setSaleBooks(books);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Failed to fetch books on sale:", err);
                setError("Failed to load books on sale");
                setLoading(false);
            });
    }, []);

    /* Loading State Display */
    if (loading) {
        return (
            <div className="text-center py-8">
                Loading sale items...
            </div>
        );
    }

    /* Error State Display */
    if (error) {
        return (
            <div className="text-center py-8 text-red-500">
                {error}
            </div>
        );
    }

    /* Filter and Validate Items */
    const validBooks = saleBooks.filter(book => book?.book_title);

    /* Empty Results Display */
    if (validBooks.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500">
                No books currently on sale
            </div>
        );
    }

    /* Carousel Component Rendering */
    return (
        <div className="flex flex-col items-center justify-center w-full">
            <div className="border-2 border-gray-400 rounded-lg py-5 px-4 md:px-8 w-full">
                <div className="relative">
                    <Carousel
                        opts={{
                            align: "start",
                            loop: validBooks.length > 1,
                            containScroll: "trimSnaps",
                            skipSnaps: false
                        }}
                        className="w-full mx-auto"
                    >
                        {/* Carousel Items - Book Cards */}
                        <CarouselContent>
                            {validBooks.map((book) => (
                                <CarouselItem
                                    key={book.id}
                                    className="basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4 px-2"
                                >
                                    <div className="p-1 h-full">
                                        <BookCard
                                            id={book.id}
                                            title={book.book_title}
                                            author={book.author}
                                            price={book.book_price}
                                            originalPrice={book.discount_price ?? undefined}
                                            imageUrl={book.book_cover_photo ?? ""}
                                            className="h-full"
                                        />
                                    </div>
                                </CarouselItem>
                            ))}
                        </CarouselContent>
                        {/* Navigation Controls - Only shown when multiple items exist */}
                        {validBooks.length > 1 && (
                            <>
                                <CarouselPrevious className="hidden md:flex -left-4 bg-white text-gray-800 border-gray-300 hover:bg-gray-100 hover:text-gray-900" />
                                <CarouselNext className="hidden md:flex -right-4 bg-white text-gray-800 border-gray-300 hover:bg-gray-100 hover:text-gray-900" />
                            </>
                        )}
                    </Carousel>
                </div>
            </div>
        </div>
    );
}

export default CarouselBar;
