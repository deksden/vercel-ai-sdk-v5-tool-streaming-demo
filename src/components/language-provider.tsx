"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'

type Language = 'en' | 'ru'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string, params?: Record<string, string>) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

// Cache for loaded translations
const translationsCache: Partial<Record<Language, Record<string, unknown>>> = {}

// Function to get nested value from object using dot notation
const getNestedValue = (obj: Record<string, unknown>, path: string): string => {
  const result = path.split('.').reduce((current: unknown, key: string) => {
    return (current && typeof current === 'object' && key in current) 
      ? (current as Record<string, unknown>)[key] 
      : undefined
  }, obj)
  return typeof result === 'string' ? result : path
}

// Function to load translations from JSON files
const loadTranslations = async (language: Language): Promise<Record<string, unknown>> => {
  if (translationsCache[language]) {
    return translationsCache[language]
  }

  try {
    const response = await fetch(`/messages/${language}.json`)
    if (!response.ok) {
      throw new Error(`Failed to load translations for ${language}`)
    }
    const translations = await response.json()
    translationsCache[language] = translations
    return translations
  } catch (error) {
    console.error(`Error loading translations for ${language}:`, error)
    // Fallback to English if current language fails
    if (language !== 'en') {
      return loadTranslations('en')
    }
    return {}
  }
}

// Function to detect system language
const detectSystemLanguage = (): Language => {
  // 1. Check ENV variable first
  const envLang = process.env.NEXT_PUBLIC_DEFAULT_LANGUAGE
  if (envLang === 'ru' || envLang === 'en') {
    console.log('🌍 Language set from ENV:', envLang)
    return envLang as Language
  }

  // 2. Check browser/system language
  if (typeof navigator !== 'undefined') {
    const browserLang = navigator.language || navigator.languages?.[0]
    console.log('🌍 Detected browser language:', browserLang)
    
    // Check for Slavic languages (Russian, Belarusian, Ukrainian)
    if (browserLang) {
      const lang = browserLang.toLowerCase()
      if (lang.startsWith('ru') || lang.startsWith('be') || lang.startsWith('uk')) {
        console.log('🌍 Slavic language detected, using Russian')
        return 'ru'
      }
    }
  }

  // 3. Fallback to English
  console.log('🌍 Using English as fallback')
  return 'en'
}

// Function to get initial language with localStorage priority
const getInitialLanguage = (): Language => {
  // 1. Check localStorage first (user preference)
  if (typeof window !== 'undefined') {
    const savedLang = localStorage.getItem('language')
    if (savedLang === 'ru' || savedLang === 'en') {
      console.log('🌍 Language restored from localStorage:', savedLang)
      return savedLang as Language
    }
  }

  // 2. Fallback to system detection
  const detected = detectSystemLanguage()
  console.log('🌍 Final language choice:', detected)
  return detected
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => detectSystemLanguage())
  const [translations, setTranslations] = useState<Record<string, unknown>>({})

  // Load translations when language changes
  useEffect(() => {
    const loadCurrentTranslations = async () => {
      const currentTranslations = await loadTranslations(language)
      setTranslations(currentTranslations)
    }
    loadCurrentTranslations()
  }, [language])

  // Synchronize language after hydration
  useEffect(() => {
    const initialLang = getInitialLanguage()
    if (initialLang !== language) {
      setLanguage(initialLang)
    }
  }, [language]) // Include language dependency

  // Save language preference to localStorage
  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang)
    if (typeof window !== 'undefined') {
      localStorage.setItem('language', lang)
    }
  }

  const t = (key: string, params?: Record<string, string>) => {
    let translation = getNestedValue(translations, key) || key
    
    // Replace parameters in translation
    if (params) {
      Object.entries(params).forEach(([param, value]) => {
        translation = translation.replace(`{${param}}`, value)
      })
    }
    
    return translation
  }

  const contextValue: LanguageContextType = {
    language,
    setLanguage: handleSetLanguage,
    t
  }

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}