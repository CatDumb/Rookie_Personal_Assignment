import CarouselBar from "@/components/Carousel/Carousel";
import {Button} from "@/components/ui/button";

const HomePage = () => {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <div className="text-lg font-bold">On sale</div>
        <Button asChild>
          <a href="/" className="text-sm text-gray-500 hover:text-gray-700">
            View all
          </a>
        </Button>
      </div>
      <CarouselBar />
    </div>
  );
};

export default HomePage;
