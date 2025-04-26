import CarouselBar from "@/components/Carousel/Carousel";
import Featured from "@/components/Featured/Featured";
import {Button} from "@/components/ui/button";

const HomePage = () => {
  return (
    <div>
      <div className="flex flex-col gap-4 py-4">
        <div className="flex justify-between items-center">
          <div className="text-lg font-bold">On sale</div>
          <Button asChild variant="link">
            <a href="/" className="text-sm text-gray-500 hover:text-gray-700">
              View all
            </a>
          </Button>
        </div>
        <CarouselBar />
      </div>

      <div className="flex flex-col gap-4 py-4">
        <Featured />
      </div>
    </div>
  );
};

export default HomePage;
