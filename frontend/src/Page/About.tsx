import { AboutHeader } from '../components/Header/AboutHeader';
import { useTranslation } from 'react-i18next';

const AboutPage = () => {
    const { t } = useTranslation();

    return (
        <div>
            {/* About Header Component - Navigation and hero image for the About page */}
            <AboutHeader />

            {/* Main Content Section - Contains company information and story */}
            <section className="max-w-4xl mx-auto">
                {/* Page Title */}
                <div className="text-5xl text-center font-bold my-4">{t('about_welcome_to_bookworm')}</div>

                {/* Company Introduction */}
                <p className="leading-[1.6] mb-4 text-left">
                    {t('about_bookworm_description')}
                </p>

                {/* Two-Column Content Layout */}
                <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-8">
                    {/* Left Column - Our Story */}
                    <div className="column flex flex-col gap-6 text-left">
                        <div className="flex-1">
                            <h3 className="text-[1.5rem] font-bold mb-4">{t('about_our_story')}</h3>
                            <p className="leading-[1.6] mb-4 text-left">
                                {t('about_our_story_1')}
                            </p>
                            <p className="leading-[1.6] mb-4 text-left">
                                {t('about_our_story_2')}
                            </p>
                            <p className="leading-[1.6] mb-4 text-left">
                                {t('about_our_story_3')}
                            </p>
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="w-px mx-4 md:w-full md:h-px md:my-8"></div>

                    {/* Right Column - Our Vision */}
                    <div className="column flex flex-col gap-6 text-left">
                        <div className="flex-1">
                            <h3 className="text-[1.5rem] font-bold mb-4">{t('about_our_vision')}</h3>
                            <p className="leading-[1.6] mb-4 text-left">
                                {t('about_our_vision_content_1')}
                            </p>
                            <p className="leading-[1.6] mb-4 text-left">
                                {t('about_our_vision_content_2')}
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default AboutPage;
