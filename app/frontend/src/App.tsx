import { useState } from 'react'
import { ThemeMode } from '@orchest/shared'

function App() {
  const [theme, setTheme] = useState<ThemeMode>(ThemeMode.LIGHT)

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Orchest UI</h1>
      <p>Current Theme: {theme}</p>
      <button onClick={() => setTheme(theme === ThemeMode.LIGHT ? ThemeMode.DARK : ThemeMode.LIGHT)}>
        Toggle Theme
      </button>
    </div>
  )
}

export default App
