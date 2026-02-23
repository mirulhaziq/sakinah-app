// Sakinah — Bottom Tab Bar (iOS-style)
// 5 tabs: Home, Journal, Chat, Hadith, Prayer
// Safe-area aware, monochrome SVG icons

import { useLocation, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useTheme } from '../context/ThemeContext'
import { useLanguage } from '../context/LanguageContext'
import SettingsSheet from './SettingsSheet'

// SVG Icons — 22px, 1.5px stroke
function HomeIcon({ active }) {
    return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
            stroke={active ? 'var(--gold)' : 'var(--text-muted)'}
            strokeWidth={active ? '2' : '1.5'} strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            {active
                ? <path d="M9 22V12h6v10" fill="var(--gold)" stroke="var(--gold)" strokeWidth="2" />
                : <polyline points="9 22 9 12 15 12 15 22" />
            }
        </svg>
    )
}

function BookIcon({ active }) {
    return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
            stroke={active ? 'var(--gold)' : 'var(--text-muted)'}
            strokeWidth={active ? '2' : '1.5'} strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"
                fill={active ? 'none' : 'none'} />
        </svg>
    )
}

function ChatIcon({ active }) {
    return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
            stroke={active ? 'var(--gold)' : 'var(--text-muted)'}
            strokeWidth={active ? '2' : '1.5'} strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
    )
}

// Scroll icon for Hadith (open book / quran)
function HadithIcon({ active }) {
    return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
            stroke={active ? 'var(--gold)' : 'var(--text-muted)'}
            strokeWidth={active ? '2' : '1.5'} strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
        </svg>
    )
}

// Mosque/crescent icon for Prayer
function PrayerIcon({ active }) {
    return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
            stroke={active ? 'var(--gold)' : 'var(--text-muted)'}
            strokeWidth={active ? '2' : '1.5'} strokeLinecap="round" strokeLinejoin="round">
            {/* Crescent moon style */}
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
    )
}

function LanternIcon({ lit }) {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
            stroke={lit ? 'var(--gold)' : 'var(--text-muted)'}
            strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 2h6l1 4H8z" />
            <rect x="7" y="6" width="10" height="12" rx="2" />
            <path d="M7 18l-2 4h14l-2-4" />
            {lit && <circle cx="12" cy="12" r="2" fill="var(--gold)" stroke="none" />}
        </svg>
    )
}

function UserIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
            stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="8" r="4" />
            <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
        </svg>
    )
}

const TABS = [
    { path: '/dashboard', Icon: HomeIcon, labelBM: 'Utama', labelEN: 'Home' },
    { path: '/journal', Icon: BookIcon, labelBM: 'Jurnal', labelEN: 'Journal' },
    { path: '/chat', Icon: ChatIcon, labelBM: 'Sembang', labelEN: 'Chat' },
    { path: '/hadith', Icon: HadithIcon, labelBM: 'Hadith', labelEN: 'Hadith' },
    { path: '/prayer', Icon: PrayerIcon, labelBM: 'Solat', labelEN: 'Prayer' },
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
            <nav style={navStyle} role="navigation" aria-label="Main navigation">
                {/* 5 main tabs */}
                {TABS.map(({ path, Icon, labelBM, labelEN }) => {
                    const isActive = location.pathname === path
                    const label = lang === 'bm' ? labelBM : labelEN
                    return (
                        <button
                            key={path}
                            id={`nav-${path.replace('/', '')}`}
                            style={tabStyle}
                            onClick={() => navigate(path)}
                            aria-label={label}
                            aria-current={isActive ? 'page' : undefined}
                        >
                            <Icon active={isActive} />
                            <span style={{
                                fontSize: 9, marginTop: 3,
                                fontFamily: 'Noto Sans, sans-serif',
                                color: isActive ? 'var(--gold)' : 'var(--text-muted)',
                                fontWeight: isActive ? 600 : 400,
                                letterSpacing: 0,
                            }}>
                                {label}
                            </span>
                        </button>
                    )
                })}

                {/* Lantern (theme toggle) */}
                <button
                    id="nav-theme-toggle"
                    style={tabStyle}
                    onClick={toggleTheme}
                    aria-label="Toggle theme"
                >
                    <LanternIcon lit={theme === 'dark'} />
                    <span style={{ fontSize: 9, marginTop: 3, color: 'var(--text-muted)', fontWeight: 400 }}>
                        {theme === 'dark'
                            ? (lang === 'bm' ? 'Gelap' : 'Dark')
                            : (lang === 'bm' ? 'Cerah' : 'Light')}
                    </span>
                </button>

                {/* Profile / Settings */}
                <button
                    id="nav-settings"
                    style={tabStyle}
                    onClick={() => setShowSettings(true)}
                    aria-label="Settings"
                >
                    <UserIcon />
                    <span style={{ fontSize: 9, marginTop: 3, color: 'var(--text-muted)', fontWeight: 400 }}>
                        {lang === 'bm' ? 'Profil' : 'Profile'}
                    </span>
                </button>
            </nav>

            {showSettings && <SettingsSheet onClose={() => setShowSettings(false)} />}
        </>
    )
}
