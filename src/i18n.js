import { createI18n } from 'vue-i18n'
import zh from './locales/zh'
import en from './locales/en'

// 获取浏览器语言
const getBrowserLanguage = () => {
  const lang = String(globalThis.navigator?.language || 'en').toLowerCase()
  if (lang.startsWith('zh')) {
    return 'zh'
  }
  return 'en'
}

// 获取保存的语言或浏览器语言
const getDefaultLanguage = () => {
  return localStorage.getItem('language') || getBrowserLanguage()
}

const i18n = createI18n({
  legacy: false,
  locale: getDefaultLanguage(),
  fallbackLocale: 'en',
  messages: {
    zh,
    en
  }
})

export default i18n
