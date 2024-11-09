import i18n from 'i18next';
import {initReactI18next} from "react-i18next";
import en from './en.json';
import es from './es.json';
import fr from './fr.json';
import ja from './ja.json';
import zh from './zh.json';
import de from './de.json';

const resources = {
    en,
    es,
    fr,
    ja,
    zh,
    de
}

i18n
.use(initReactI18next)
.init({
    compatibilityJSON: 'v3',
    resources,
    fallbackLng: 'en',
    lng: 'en'
})

export default { i18n }
