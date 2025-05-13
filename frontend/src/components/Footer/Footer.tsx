import { useTranslation } from "react-i18next";

const Footer = () => {
    const { t } = useTranslation();
    return (
        <div className="sticky bottom-0 bg-gray-300 text-black w-full h-[var(--footer-height)]">
            <div className="container mx-auto px-2 sm:px-3 lg:px-4 xl:px-10 flex items-center h-full gap-2">
                <img src="/book.png" alt="Logo" className="w-14 h-14" />
                <div>
                    <div className="font-bold text-xl">BOOKWORM</div>
                    <div className="text-sm">{t('footer_address')}</div>
                    <div className="text-sm">{t('footer_phone')}</div>
                </div>
            </div>
        </div>
    );
};

export default Footer;
