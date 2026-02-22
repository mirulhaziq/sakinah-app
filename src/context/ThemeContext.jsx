import { createContext, useContext, useState, useEffect } from 'react'

export const ThemeContext = createContext(null)

const DARK = {
    '--bg': '#080808',
    '--card': '#141414',
    '--surface': '#1E1E1E',
    '--border': 'rgba(255,255,255,0.07)',
    '--text': '#F5EFE0',
    '--text-sub': 'rgba(245,239,224,0.50)',
    '--text-muted': 'rgba(245,239,224,0.28)',
    '--gold': '#C9A96E',
    '--error': '#f87171',
    '--success': '#4ade80',
    '--tab-bg': 'rgba(8,8,8,0.94)',
    '--shadow-card': 'none',
}

const LIGHT = {
    '--bg': '#F8F6F1',
    '--card': '#FFFFFF',
    '--surface': '#F0EDE6',
    '--border': 'rgba(0,0,0,0.07)',
    '--text': '#1A160B',
    '--text-sub': 'rgba(26,22,11,0.50)',
    '--text-muted': 'rgba(26,22,11,0.30)',
    '--gold': '#9B7A3D',
    '--error': '#dc2626',
    '--success': '#16a34a',
    '--tab-bg': 'rgba(248,246,241,0.94)',
    '--shadow-card': '0 2px 12px rgba(0,0,0,0.06)',
}

function apply(vars) {
    const root = document.documentElement
    Object.entries(vars).forEach(([k, v]) => root.style.setProperty(k, v))
}

export function ThemeProvider({ children }) {
    const [theme, setThemeState] = useState(
        () => localStorage.getItem('sakinah_theme') || 'dark'
    )

    useEffect(() => { apply(theme === 'dark' ? DARK : LIGHT) }, [theme])

    function toggleTheme() {
        const next = theme === 'dark' ? 'light' : 'dark'
        setThemeState(next)
        localStorage.setItem('sakinah_theme', next)
    }

    function setTheme(val) {
        setThemeState(val)
        localStorage.setItem('sakinah_theme', val)
    }

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    )
}

export function useTheme() {
    const ctx = useContext(ThemeContext)
    if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
    return ctx
}
