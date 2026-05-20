import { en } from './en'
import { es } from './es'

type Lang = 'en' | 'es'
const translations = { en, es } as const

export function t(lang: Lang) {
  return translations[lang]
}

export function getAlternateLangPath(currentPath: string, targetLang: Lang): string {
  if (targetLang === 'es') {
    return currentPath.startsWith('/es') ? currentPath : `/es${currentPath}`
  }
  return currentPath.replace(/^\/es/, '') || '/'
}
