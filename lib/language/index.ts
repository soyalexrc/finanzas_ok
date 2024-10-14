import i18n from 'i18next';
import {initReactI18next} from "react-i18next";
import en from './en.json';
import es from './es.json';

const resources = {
    en,
    es
}

i18n
.use(initReactI18next)
.init({
    compatibilityJSON: 'v3',
    resources,
    lng: 'es'
})

export default { i18n }
