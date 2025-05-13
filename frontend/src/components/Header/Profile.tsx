/* Profile Header Component - Displays the profile page title */
import { useTranslation } from 'react-i18next';

/* Props Interface */
interface ProfileHeaderProps {
    text: string;
}

/**
 * Profile page header displaying the profile page title
 * @param text String representing the number of items in cart
 */
export const ProfileHeader = ({ text = "Profile" }: ProfileHeaderProps) => {
    const { t } = useTranslation();

    return (
        <div className="header">
            <div className="font-bold my-4 text-2xl"><h3>{text || t('header_profile')}</h3></div>
            <hr></hr>
        </div>
    )
}
