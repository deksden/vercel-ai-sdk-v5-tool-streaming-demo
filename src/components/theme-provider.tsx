"use client"

import { ThemeProvider as NextThemesProvider } from "next-themes"

// Function to get default theme from environment
const getDefaultTheme = (): string => {
  // Check ENV variable first
  const envTheme = process.env.NEXT_PUBLIC_DEFAULT_THEME
  if (envTheme === 'light' || envTheme === 'dark' || envTheme === 'system') {
    console.log('🎨 Theme set from ENV:', envTheme)
    return envTheme
  }
  
  // Default to system
  return 'system'
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const defaultTheme = getDefaultTheme()

  return (
    <NextThemesProvider 
      attribute="class" 
      defaultTheme={defaultTheme}
      enableSystem
      disableTransitionOnChange
      storageKey="theme"
    >
      {children}
    </NextThemesProvider>
  )
}