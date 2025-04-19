// src/pages/AboutPage.tsx
import { AboutHeader } from '../Header/AboutHeader';
import './About.css'; // Create this CSS file

const AboutPage = () => {
    return (
        <div className="page-container">
            <AboutHeader />
            <section className="about-content">
                <h1 className="welcome-title">Welcome to Bookworm</h1>

                <p className="section-text">
                    "Bookworm is an independent New York bookstore and language school with locations in Manhattan and Brooklyn. We specialize in travel books and language classes."
                </p>

                <div className="two-column-layout">
                    <div className="column">
                        <div className="content-block">
                            <h3 className="section-title">Our Story</h3>
                            <p className="section-text">
                                The name Bookworm was taken from the original name for New York International Airport, which was renamed JFK in December 1963.
                            </p>
                            <p className="section-text">
                                Our Manhattan store has just moved to the West Village. Our new location is 170 7th Avenue South, at the corner of Perry Street.
                            </p>
                            <p className="section-text">
                                From March 2008 through May 2016, the store was located in the Flatiron District.
                            </p>
                        </div>
                    </div>

                    <div className="column-divider"></div>

                    <div className="column">
                        <div className="content-block">
                            <h3 className="section-title">Our Vision</h3>
                            <p className="section-text">
                                One of the last travel bookstores in the country, our Manhattan store carries a range of guidebooks (all 10% off) to suit the needs and tastes of every traveler and budget.
                            </p>
                            <p className="section-text">
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
