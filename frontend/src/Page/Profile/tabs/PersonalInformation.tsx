import { useTranslation } from 'react-i18next';

const PersonalInformation = () => {
    const { t } = useTranslation();

    return (
        <div>
            <h2 className="text-2xl font-bold mb-4">{t('profile_personal_information')}</h2>
            <hr></hr>
        </div>
    )
}

export default PersonalInformation;
