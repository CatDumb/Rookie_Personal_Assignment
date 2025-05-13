/* About Header Component - Displays the about page title */
import { useTranslation } from 'react-i18next';

/**
 * About page header with static title
 * Simple header for the About Us page
 */
export const AboutHeader = () => {
    const { t } = useTranslation();

    return (
        <div className="header">
            <div className="font-bold my-4 text-2xl"><h3>{t('header_about')}</h3></div>
            <hr></hr>
        </div>
    );
};
