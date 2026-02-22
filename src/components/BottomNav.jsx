// Sakinah — Bottom Tab Bar (iOS-style)
// Fixed bottom, SVG icons only, safe-area aware

import { useLocation, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useTheme } from '../context/ThemeContext'
import { useLanguage } from '../context/LanguageContext'
import SettingsSheet from './SettingsSheet'

// SVG Icons — 22px, 1.5px stroke, line style
function HomeIcon({ active }) {
    return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
            stroke={active ? 'var(--gold)' : 'var(--text-sub)'}
            strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
    )
}

function BookIcon({ active }) {
    return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
            stroke={active ? 'var(--gold)' : 'var(--text-sub)'}
            strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </svg>
    )
}

function ChatIcon({ active }) {
    return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
            stroke={active ? 'var(--gold)' : 'var(--text-sub)'}
            strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
    )
}

function HeartIcon({ active }) {
    return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
            stroke={active ? 'var(--gold)' : 'var(--text-sub)'}
            strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
    )
}

function LanternIcon({ lit }) {
    return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
            stroke={lit ? 'var(--gold)' : 'var(--text-sub)'}
            strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 2h6l1 4H8z" />
            <rect x="7" y="6" width="10" height="12" rx="2" />
            <path d="M7 18l-2 4h14l-2-4" />
            {lit && <circle cx="12" cy="12" r="2" fill="var(--gold)" stroke="none" />}
        </svg>
    )
}

const TABS = [
    { path: '/dashboard', Icon: HomeIcon, labelBM: 'Utama', labelEN: 'Home' },
    { path: '/journal', Icon: BookIcon, labelBM: 'Jurnal', labelEN: 'Journal' },
    { path: '/chat', Icon: ChatIcon, labelBM: 'Sembang', labelEN: 'Chat' },
    { path: '/mood', Icon: HeartIcon, labelBM: 'Mood', labelEN: 'Mood' },
]

export default function BottomNav() {
    const location = useLocation()
    const navigate = useNavigate()
    const { theme, toggleTheme } = useTheme()
    const { lang } = useLanguage()
    const [showSettings, setShowSettings] = useState(false)

    const navStyle = {
        position: 'fixed',
        bottom: 0, left: '50%',
        transform: 'translateX(-50%)',
        width: '100%', maxWidth: 480,
        background: 'var(--tab-bg)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '0.5px solid var(--border)',
        display: 'flex', alignItems: 'center',
        paddingBottom: 'env(safe-area-inset-bottom, 8px)',
        zIndex: 100,
    }

    const tabStyle = {
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '10px 0 8px',
        cursor: 'pointer', border: 'none', background: 'none',
        WebkitTapHighlightColor: 'transparent',
        minHeight: 56,
    }

    return (
        <>
            <nav style={navStyle}>
                {TABS.map(({ path, Icon, labelBM, labelEN }) => {
                    const isActive = location.pathname === path
                    const label = lang === 'bm' ? labelBM : labelEN
                    return (
                        <button key={path} style={tabStyle} onClick={() => navigate(path)}>
                            <Icon active={isActive} />
                            <span style={{
                                fontSize: 10, marginTop: 3, fontFamily: 'Noto Sans, sans-serif',
                                color: isActive ? 'var(--gold)' : 'var(--text-muted)',
                                fontWeight: isActive ? 500 : 400,
                                letterSpacing: 0,
                            }}>
                                {label}
                            </span>
                        </button>
                    )
                })}

                {/* Lantern (theme) + Settings */}
                <button style={tabStyle} onClick={toggleTheme} title="Toggle theme">
                    <LanternIcon lit={theme === 'dark'} />
                    <span style={{ fontSize: 10, marginTop: 3, color: 'var(--text-muted)', fontWeight: 400 }}>
                        {theme === 'dark' ? (lang === 'bm' ? 'Gelap' : 'Dark') : (lang === 'bm' ? 'Terang' : 'Light')}
                    </span>
                </button>

                <button style={tabStyle} onClick={() => setShowSettings(true)} title="Settings">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                        stroke="var(--text-sub)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="8" r="4" />
                        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                    </svg>
                    <span style={{ fontSize: 10, marginTop: 3, color: 'var(--text-muted)', fontWeight: 400 }}>
                        {lang === 'bm' ? 'Profil' : 'Profile'}
                    </span>
                </button>
            </nav>

            {showSettings && <SettingsSheet onClose={() => setShowSettings(false)} />}
        </>
    )
}
