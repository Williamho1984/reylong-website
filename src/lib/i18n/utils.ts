import { en } from './en'
import { es } from './es'
import { zh } from './zh'

type Lang = 'en' | 'es' | 'zh'
const translations = { en, es, zh } as const

export function t(lang: Lang) {
  return translations[lang]
}

export function getAlternateLangPath(currentPath: string, targetLang: Lang): string {
  if (targetLang === 'es') {
    return currentPath.startsWith('/es') ? currentPath : `/es${currentPath}`
  }
  if (targetLang === 'zh') {
    return currentPath.startsWith('/zh') ? currentPath : `/zh${currentPath}`
  }
  return currentPath.replace(/^\/es/, '').replace(/^\/zh/, '') || '/'
}
