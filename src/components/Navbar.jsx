// Sakinah سكينة — Navbar Component (full inline styles)
// Includes: logo, nav links, lang toggle, lantern toggle, settings gear

import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import { useTheme } from '../context/ThemeContext'
import SettingsSheet from './SettingsSheet'

function LanternIcon({ lit }) {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 2h6l1 4H8z" />
            <rect x="7" y="6" width="10" height="12" rx="2" />
            <path d="M7 18l-2 4h14l-2-4" />
            {lit && <circle cx="12" cy="12" r="2" fill="var(--accent)" stroke="none" />}
        </svg>
    )
}

export default function Navbar() {
    const { user, profile } = useAuth()
    const { lang, setLang, t } = useLanguage()
    const { theme, toggleTheme } = useTheme()
    const location = useLocation()
    const [showSettings, setShowSettings] = useState(false)

    const navLinks = [
        { to: '/dashboard', labelKey: 'navDashboard' },
        { to: '/journal', labelKey: 'navJournal' },
        { to: '/chat', labelKey: 'navChat' },
        { to: '/mood', labelKey: 'navMood' },
    ]

    const isActive = (path) => location.pathname === path

    const navStyle = {
        position: 'sticky', top: 0, zIndex: 100,
        background: 'var(--bg-secondary)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderBottom: '1px solid var(--glass-border)',
        padding: '0 16px',
    }

    const innerStyle = {
        maxWidth: 480, margin: '0 auto',
        display: 'flex', alignItems: 'center',
        height: 56, gap: 4,
    }

    const logoStyle = {
        display: 'flex', alignItems: 'center', gap: 8,
        textDecoration: 'none', marginRight: 'auto',
        flexShrink: 0,
    }

    const logoTextStyle = {
        fontFamily: "'Playfair Display', serif",
        fontSize: 18, fontWeight: 700,
        color: 'var(--accent)',
        letterSpacing: '-0.02em',
    }

    const arabicStyle = {
        fontFamily: "'Noto Naskh Arabic', serif",
        fontSize: 14, color: 'var(--text-muted)',
        marginTop: 2,
    }

    const linkStyle = (active) => ({
        display: 'flex', alignItems: 'center',
        padding: '6px 8px', borderRadius: 8,
        textDecoration: 'none',
        fontSize: 12, fontWeight: active ? 600 : 500,
        color: active ? 'var(--accent)' : 'var(--text-muted)',
        background: active ? 'rgba(201, 169, 110, 0.1)' : 'transparent',
        transition: 'all 0.2s ease',
        whiteSpace: 'nowrap',
    })

    const iconBtnStyle = {
        background: 'transparent', border: 'none',
        color: 'var(--text-secondary)',
        padding: 6, borderRadius: 8, cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 0.2s ease', fontSize: 13,
        minWidth: 32, minHeight: 32,
    }

    const langBtnStyle = {
        background: 'transparent',
        border: '1px solid transparent',
        color: 'var(--text-muted)',
        padding: '3px 8px', borderRadius: 20,
        fontSize: 11, fontWeight: 600,
        cursor: 'pointer', transition: 'all 0.2s ease',
        letterSpacing: '0.05em',
    }

    return (
        <>
            <nav style={navStyle}>
                <div style={innerStyle}>
                    {/* Logo */}
                    <Link to="/dashboard" style={logoStyle}>
                        <div style={{ position: 'relative' }}>
                            <span style={logoTextStyle}>Sakinah</span>
                        </div>
                        <span style={arabicStyle}>سكينة</span>
                    </Link>

                    {/* Nav links */}
                    {navLinks.map(({ to, labelKey }) => (
                        <Link key={to} to={to} style={linkStyle(isActive(to))}>
                            {t(labelKey)}
                        </Link>
                    ))}

                    {/* Right controls */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 2, marginLeft: 4 }}>
                        {/* Lang toggle */}
                        <button
                            onClick={() => setLang(lang === 'bm' ? 'en' : 'bm')}
                            style={langBtnStyle}
                            title="Toggle language"
                            onMouseEnter={e => {
                                e.currentTarget.style.borderColor = 'var(--accent)'
                                e.currentTarget.style.color = 'var(--accent)'
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.borderColor = 'transparent'
                                e.currentTarget.style.color = 'var(--text-muted)'
                            }}
                        >
                            {t('navLangToggle')}
                        </button>

                        {/* Lantern / theme toggle */}
                        <button
                            onClick={toggleTheme}
                            style={{
                                ...iconBtnStyle,
                                color: theme === 'dark' ? 'var(--accent)' : 'var(--text-secondary)',
                            }}
                            title={theme === 'dark' ? 'Switch to light' : 'Switch to dark'}
                            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-card)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                            <LanternIcon lit={theme === 'dark'} />
                        </button>

                        {/* Settings / profile */}
                        <button
                            onClick={() => setShowSettings(true)}
                            style={iconBtnStyle}
                            title={t('navSettings')}
                            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-card)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="3" />
                                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                            </svg>
                        </button>
                    </div>
                </div>
            </nav>

            {showSettings && <SettingsSheet onClose={() => setShowSettings(false)} />}
        </>
    )
}
