import LanguageSwitcher from '@/components/ui/localization';
import { useTranslation } from 'react-i18next';

const Settings = () => {
    const { t } = useTranslation();

    return (
        <div className='w-full'>
            <h2 className="text-2xl font-bold mb-4">{t('profile_settings_title')}</h2>
            <hr></hr>
            <div>
                <label>{t('profile_settings_language')}</label>
                <LanguageSwitcher />
            </div>
        </div>
    )
}

export default Settings;
