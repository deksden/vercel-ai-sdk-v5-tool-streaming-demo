"use client"

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Languages, Check } from 'lucide-react'
import { useLanguage } from '../language-provider'

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" data-testid="language-toggle">
          <Languages className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">Switch language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" data-testid="language-menu">
        <DropdownMenuItem 
          onClick={() => setLanguage('en')}
          data-testid="language-en"
          className={language === 'en' ? 'bg-accent' : ''}
        >
          <div className="flex items-center justify-between w-full">
            <span>English</span>
            {language === 'en' && <Check className="h-4 w-4" />}
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setLanguage('ru')}
          data-testid="language-ru"
          className={language === 'ru' ? 'bg-accent' : ''}
        >
          <div className="flex items-center justify-between w-full">
            <span>Русский</span>
            {language === 'ru' && <Check className="h-4 w-4" />}
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}