import i18n from "i18next"
import { initReactI18next } from "react-i18next"
import en from "./locales/en.json"
import ja from "./locales/ja.json"

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    ja: { translation: ja },
  },
  lng: navigator.language.startsWith("ja") ? "ja" : "en",
  fallbackLng: "en",
  interpolation: { escapeValue: false },
})

// Keep <html lang> in sync so screen readers switch pronunciation (WCAG 3.1.1)
document.documentElement.lang = i18n.language
i18n.on("languageChanged", lng => {
  document.documentElement.lang = lng
})

export default i18n
