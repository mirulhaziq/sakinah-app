import { createContext, useContext, useState, useEffect } from 'react'
import { translations } from '../translations/translations'

export const LanguageContext = createContext(null)

export function LanguageProvider({ children }) {
    const [lang, setLangState] = useState(() => {
        return localStorage.getItem('sakinah_lang') || 'bm'
    })

    function setLang(newLang) {
        setLangState(newLang)
        localStorage.setItem('sakinah_lang', newLang)
    }

    // Translation helper
    function t(key) {
        const val = translations[lang]?.[key]
        if (val === undefined) {
            // Fallback to BM
            return translations.bm[key] ?? key
        }
        return val
    }

    return (
        <LanguageContext.Provider value={{ lang, setLang, t }}>
            {children}
        </LanguageContext.Provider>
    )
}

export function useLanguage() {
    const ctx = useContext(LanguageContext)
    if (!ctx) throw new Error('useLanguage must be used within LanguageProvider')
    return ctx
}
