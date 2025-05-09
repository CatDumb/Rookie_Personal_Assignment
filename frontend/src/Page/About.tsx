import { AboutHeader } from '../components/Header/AboutHeader';

const AboutPage = () => {
    return (
        <div>
            {/* About Header Component - Navigation and hero image for the About page */}
            <AboutHeader />

            {/* Main Content Section - Contains company information and story */}
            <section className="max-w-4xl mx-auto">
                {/* Page Title */}
                <div className="text-5xl text-center font-bold my-4">Welcome to Bookworm</div>

                {/* Company Introduction */}
                <p className="leading-[1.6] mb-4 text-left">
                    "Bookworm is an independent New York bookstore and language school with locations in Manhattan and Brooklyn. We specialize in travel books and language classes."
                </p>

                {/* Two-Column Content Layout */}
                <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-8">
                    {/* Left Column - Our Story */}
                    <div className="column flex flex-col gap-6 text-left">
                        <div className="flex-1">
                            <h3 className="text-[1.5rem] font-bold mb-4">Our Story</h3>
                            <p className="leading-[1.6] mb-4 text-left">
                                The name Bookworm was taken from the original name for New York International Airport, which was renamed JFK in December 1963.
                            </p>
                            <p className="leading-[1.6] mb-4 text-left">
                                Our Manhattan store has just moved to the West Village. Our new location is 170 7th Avenue South, at the corner of Perry Street.
                            </p>
                            <p className="leading-[1.6] mb-4 text-left">
                                From March 2008 through May 2016, the store was located in the Flatiron District.
                            </p>
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="w-px mx-4 md:w-full md:h-px md:my-8"></div>

                    {/* Right Column - Our Vision */}
                    <div className="column flex flex-col gap-6 text-left">
                        <div className="flex-1">
                            <h3 className="text-[1.5rem] font-bold mb-4">Our Vision</h3>
                            <p className="leading-[1.6] mb-4 text-left">
                                One of the last travel bookstores in the country, our Manhattan store carries a range of guidebooks (all 10% off) to suit the needs and tastes of every traveler and budget.
                            </p>
                            <p className="leading-[1.6] mb-4 text-left">
                                We believe that a novel or travelogue can be just as valuable a key to a place as any guidebook, and our well-read, well-travelled staff is happy to make reading recommendations for any traveller, book lover, or gift giver.
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default AboutPage;
