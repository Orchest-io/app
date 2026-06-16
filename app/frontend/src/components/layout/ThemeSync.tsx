import { useEffect, useRef } from 'react'
import { useMe } from '../../hooks/useSettings'
import { useTheme } from '../../context/ThemeContext'

export default function ThemeSync() {
  const { data: user } = useMe()
  const { setTheme } = useTheme()
  const hasSynced = useRef(false)

  useEffect(() => {
    if (!user) {
      hasSynced.current = false
      return
    }

    if (!hasSynced.current) {
      const backendTheme = (user as any)?.settings?.theme
      if (backendTheme && (backendTheme === 'light' || backendTheme === 'dark' || backendTheme === 'system')) {
        setTheme(backendTheme)
      }
      hasSynced.current = true
    }
  }, [user, setTheme])

  return null
}
