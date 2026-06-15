import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import translationEN from './locales/en.json'
import translationAR from './locales/ar.json'

const resources = {
  en: {
    translation: translationEN,
  },
  ar: {
    translation: translationAR,
  },
}

const savedLanguage = localStorage.getItem('language') || 'en'

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: savedLanguage,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  })

// Set layout direction helper
const applyLayoutDirection = (lng: string) => {
  const dir = lng === 'ar' ? 'rtl' : 'ltr'
  document.documentElement.dir = dir
  document.documentElement.lang = lng
  
  if (lng === 'ar') {
    document.documentElement.classList.add('rtl-layout')
  } else {
    document.documentElement.classList.remove('rtl-layout')
  }
}

// Initial layout direction trigger
applyLayoutDirection(savedLanguage)

// Change direction dynamically when language changes
i18n.on('languageChanged', (lng) => {
  applyLayoutDirection(lng)
})

export default i18n
