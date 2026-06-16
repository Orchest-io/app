import { useEffect, useRef } from 'react'
import { useMe } from '../../hooks/useSettings'
import { useTranslation } from 'react-i18next'

export default function LanguageSync() {
  const { data: user } = useMe()
  const { i18n } = useTranslation()
  const hasSynced = useRef(false)

  useEffect(() => {
    if (!user) {
      hasSynced.current = false
      return
    }

    if (!hasSynced.current) {
      const backendLanguage = (user as any)?.settings?.language
      if (backendLanguage && ['en', 'ar', 'fr', 'de', 'es'].includes(backendLanguage)) {
        if (backendLanguage !== i18n.language) {
          i18n.changeLanguage(backendLanguage)
          localStorage.setItem('language', backendLanguage)
        }
      }
      hasSynced.current = true
    }
  }, [user, i18n])

  return null
}
