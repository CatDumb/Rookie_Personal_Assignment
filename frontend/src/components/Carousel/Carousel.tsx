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
    const [saleBooks, setSaleBooks] = useState<OnSaleItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

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

    // Show loading state
    if (loading) {
        return (
            <div className="text-center py-8">
                Loading sale items...
            </div>
        );
    }

    // Show error state
    if (error) {
        return (
            <div className="text-center py-8 text-red-500">
                {error}
            </div>
        );
    }

    // Filter out empty items and ensure minimum 1 item
    const validBooks = saleBooks.filter(book => book?.name);

    if (validBooks.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500">
                No books currently on sale
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center w-full">
            <div className="border-2 border-gray-400 rounded-lg py-5 px-10 w-full">
                <div className="relative px-8">
                    <Carousel
                        opts={{
                            align: "start",
                            loop: validBooks.length > 1,
                            dragFree: true
                        }}
                        className="w-full"
                    >
                        <CarouselContent className="gap-4 px-4">
                            {validBooks.map((book) => (
                                <CarouselItem
                                    key={book.id}
                                    className="basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4 pr-4"
                                >
                                    <div className="flex items-center justify-center">
                                        <BookCard
                                            id={book.id}
                                            title={book.name}
                                            author={book.author}
                                            price={book.price}
                                            originalPrice={book.discount_price ?? undefined}
                                            imageUrl={book.cover_photo ?? ""}
                                        />
                                    </div>
                                </CarouselItem>
                            ))}
                        </CarouselContent>
                        {validBooks.length > 1 && (
                            <>
                                <CarouselPrevious className="-left-8 bg-white text-gray-800 border-gray-300 hover:bg-gray-100 hover:text-gray-900" />
                                <CarouselNext className="-right-8 bg-white text-gray-800 border-gray-300 hover:bg-gray-100 hover:text-gray-900" />
                            </>
                        )}
                    </Carousel>
                </div>
            </div>
        </div>
    );
}

export default CarouselBar;
