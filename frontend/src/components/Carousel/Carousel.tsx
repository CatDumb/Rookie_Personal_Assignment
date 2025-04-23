import { BookCard } from "../ui/card";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "../ui/carousel";

const CarouselBar = () => {
    return (
        <div className="flex flex-col items-center justify-center">
            <div className="border-2 border-gray-400 rounded-lg py-5 px-4 w-full relative">
                <div className="relative">
                    <Carousel
                        opts={{
                            align: "start",
                            loop: true
                        }}
                        className="w-full"
                    >
                        <CarouselContent className="flex ml-10 gap-4">
                            <CarouselItem key="item-1" className="basis-1/4">
                                <div>
                                    <BookCard
                                        title="Where the Crawdads Sing"
                                        author="Delia Owens"
                                        price={20.0}
                                        originalPrice={49.09}
                                        imageUrl="/crawdads.jpg"
                                    />
                                </div>
                            </CarouselItem>
                            <CarouselItem key="item-2" className="basis-1/4">
                                <div>
                                    <BookCard
                                        title="Book Title 2"
                                        author="Author 2"
                                        price={25.0}
                                        originalPrice={50.0}
                                        imageUrl="/book2.jpg"
                                    />
                                </div>
                            </CarouselItem>
                            <CarouselItem key="item-3" className="basis-1/4">
                                <div>
                                    <BookCard
                                        title="Book Title 3"
                                        author="Author 3"
                                        price={30.0}
                                        originalPrice={60.0}
                                        imageUrl="/book3.jpg"
                                    />
                                </div>
                            </CarouselItem>
                            <CarouselItem key="item-4" className="basis-1/4">
                                <div>
                                    <BookCard
                                        title="Book Title 4"
                                        author="Author 4"
                                        price={35.0}
                                        originalPrice={70.0}
                                        imageUrl="/book4.jpg"
                                    />
                                </div>
                            </CarouselItem>
                            <CarouselItem key="item-5" className="basis-1/4">
                                <div className="p-1">
                                    <BookCard
                                        title="Book Title 5"
                                        author="Author 5"
                                        price={40.0}
                                        originalPrice={80.0}
                                        imageUrl="/book5.jpg"
                                    />
                                </div>
                            </CarouselItem>
                            <CarouselItem key="item-6" className="basis-1/4">
                                <div className="p-1">
                                    <BookCard
                                        title="Book Title 6"
                                        author="Author 6"
                                        price={45.0}
                                        originalPrice={90.0}
                                        imageUrl="/book6.jpg"
                                    />
                                </div>
                            </CarouselItem>
                            <CarouselItem key="item-7" className="basis-1/4">
                                <div className="p-1">
                                    <BookCard
                                        title="Book Title 7"
                                        author="Author 7"
                                        price={50.0}
                                        originalPrice={100.0}
                                        imageUrl="/book7.jpg"
                                    />
                                </div>
                            </CarouselItem>
                            <CarouselItem key="item-8" className="basis-1/4">
                                <div className="p-1">
                                    <BookCard
                                        title="Book Title 8"
                                        author="Author 8"
                                        price={55.0}
                                        originalPrice={110.0}
                                        imageUrl="/book8.jpg"
                                    />
                                </div>
                            </CarouselItem>
                        </CarouselContent>
                        {/* Buttons remain in place */}
                        <CarouselPrevious />
                        <CarouselNext />
                    </Carousel>
                </div>
            </div>
        </div>
    );
};

export default CarouselBar;
