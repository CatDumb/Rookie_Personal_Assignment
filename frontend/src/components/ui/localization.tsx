import { useTranslation } from 'react-i18next';
import {
  Dropdown,
  DropdownOption
 } from './dropdown';
import { Language, LANGUAGE } from '../../api/shop';

const languageOptions: DropdownOption<Language>[] = LANGUAGE.map(option => ({
  value: option,
  label: option
}));

function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    console.log("changeLanguage", i18n.language);
    i18n.changeLanguage(lng);
    console.log("changeLanguage", i18n.language);
  };

  return (
    <>
      <Dropdown<Language>
        value={i18n.language as Language}
        options={languageOptions}
        onChange={changeLanguage}
      />
    </>
  );
}

export default LanguageSwitcher;
