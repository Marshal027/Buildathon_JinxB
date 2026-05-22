import { useEffect } from 'react'
import SmartFactoryApp from '../smartfactory/App.jsx'

function Home() {
  useEffect(() => {
    // Save original styles
    const prevBg = document.body.style.backgroundColor
    const prevColor = document.body.style.color
    const prevColorScheme = document.documentElement.style.colorScheme

    // Apply dark premium background specifically for the dashboard layout
    document.body.style.backgroundColor = '#0a0a0b'
    document.body.style.color = '#ffffff'
    document.documentElement.style.colorScheme = 'dark'

    return () => {
      // Revert when navigating away to other pages
      document.body.style.backgroundColor = prevBg
      document.body.style.color = prevColor
      document.documentElement.style.colorScheme = prevColorScheme
    }
  }, [])

  return <SmartFactoryApp />
}

export default Home
