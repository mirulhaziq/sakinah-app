import { createContext, useContext, useState, useEffect } from 'react'

export const ThemeContext = createContext(null)

// CSS variables for dark and light themes
const DARK_VARS = {
    '--bg-primary': '#0d0d12',
    '--bg-secondary': 'rgba(20, 18, 28, 0.92)',
    '--bg-card': 'rgba(255, 255, 255, 0.04)',
    '--bg-card-hover': 'rgba(255, 255, 255, 0.07)',
    '--glass-border': 'rgba(201, 169, 110, 0.18)',
    '--glass-border-hover': 'rgba(201, 169, 110, 0.38)',
    '--accent': '#C9A96E',
    '--accent-dark': '#a88040',
    '--accent-gradient': 'linear-gradient(135deg, #C9A96E, #a88040)',
    '--accent-glow': '0 0 40px rgba(201, 169, 110, 0.2)',
    '--text-primary': '#f5efe0',
    '--text-secondary': 'rgba(245, 239, 224, 0.65)',
    '--text-muted': 'rgba(245, 239, 224, 0.35)',
    '--surface': 'rgba(255, 255, 255, 0.04)',
    '--success': '#4ade80',
    '--error': '#f87171',
    '--shadow': '0 8px 32px rgba(0,0,0,0.5)',
    '--shadow-lg': '0 20px 60px rgba(0,0,0,0.7)',
}

const LIGHT_VARS = {
    '--bg-primary': '#f7f3ec',
    '--bg-secondary': 'rgba(245, 239, 224, 0.95)',
    '--bg-card': 'rgba(255, 255, 255, 0.7)',
    '--bg-card-hover': 'rgba(255, 255, 255, 0.9)',
    '--glass-border': 'rgba(155, 122, 61, 0.2)',
    '--glass-border-hover': 'rgba(155, 122, 61, 0.45)',
    '--accent': '#9B7A3D',
    '--accent-dark': '#7a5f2e',
    '--accent-gradient': 'linear-gradient(135deg, #9B7A3D, #7a5f2e)',
    '--accent-glow': '0 0 40px rgba(155, 122, 61, 0.2)',
    '--text-primary': '#1a1407',
    '--text-secondary': 'rgba(26, 20, 7, 0.65)',
    '--text-muted': 'rgba(26, 20, 7, 0.4)',
    '--surface': 'rgba(255, 255, 255, 0.65)',
    '--success': '#16a34a',
    '--error': '#dc2626',
    '--shadow': '0 8px 32px rgba(0,0,0,0.12)',
    '--shadow-lg': '0 20px 60px rgba(0,0,0,0.2)',
}

function applyTheme(theme) {
    const vars = theme === 'dark' ? DARK_VARS : LIGHT_VARS
    const root = document.documentElement
    Object.entries(vars).forEach(([key, value]) => {
        root.style.setProperty(key, value)
    })
    root.setAttribute('data-theme', theme)
}

export function ThemeProvider({ children }) {
    const [theme, setThemeState] = useState(() => {
        return localStorage.getItem('sakinah_theme') || 'dark'
    })

    useEffect(() => {
        applyTheme(theme)
    }, [theme])

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
