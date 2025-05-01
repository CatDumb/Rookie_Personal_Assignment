import CarouselBar from "@/components/Carousel/Carousel";
import Featured from "@/components/Featured/Featured";
import {Button} from "@/components/ui/button";
import { Link } from "react-router-dom";

const HomePage = () => {
  return (
    <div>
      <div className="flex flex-col gap-4 py-4">
        <div className="flex justify-between items-center">
          <div className="text-2xl font-bold">On sale</div>
          <Button>
            <Link to="/shop">
              View all
            </Link>
          </Button>
        </div>
        <div className="py-2">
          <CarouselBar />
        </div>
      </div>

      <div className="flex flex-col gap-4 py-4">
        <Featured />
      </div>
    </div>
  );
};

export default HomePage;
