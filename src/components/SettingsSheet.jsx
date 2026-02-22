// Sakinah سكينة — Settings Sheet Component
// Slides up from bottom, full profile + preferences management

import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import { useTheme } from '../context/ThemeContext'
import { PERSONAS } from '../data/personas'
import ConfirmModal from './ConfirmModal'

export default function SettingsSheet({ onClose }) {
    const { user, profile, updateProfile, signOut } = useAuth()
    const { lang, setLang, t } = useLanguage()
    const { theme, setTheme } = useTheme()
    const [name, setName] = useState(profile?.name || '')
    const [persona, setPersona] = useState(profile?.preferred_persona || 'balanced')
    const [saving, setSaving] = useState(false)
    const [saved, setSaved] = useState(false)
    const [saveError, setSaveError] = useState(null)
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

    useEffect(() => {
        if (profile) {
            setName(profile.name || '')
            setPersona(profile.preferred_persona || 'balanced')
        }
    }, [profile])

    async function handleSave() {
        setSaving(true)
        setSaveError(null)
        try {
            await updateProfile({ name, preferred_persona: persona, preferred_lang: lang })
            setSaved(true)
            setTimeout(() => setSaved(false), 2000)
        } catch (err) {
            setSaveError(err.message)
        } finally {
            setSaving(false)
        }
    }

    async function handleLogout() {
        await signOut()
        onClose()
    }

    function handleTriggerOnboarding() {
        localStorage.removeItem('sakinah_onboarded')
        onClose()
        window.location.reload()
    }

    const overlayStyle = {
        position: 'fixed', inset: 0, zIndex: 9998,
        background: 'rgba(0,0,0,0.55)',
        backdropFilter: 'blur(6px)',
        animation: 'sakinahFadeIn 0.2s ease',
    }

    const sheetStyle = {
        position: 'fixed', bottom: 0, left: '50%',
        transform: 'translateX(-50%)',
        width: '100%', maxWidth: 480,
        background: 'var(--bg-secondary)',
        border: '1px solid var(--glass-border)',
        borderBottom: 'none',
        borderRadius: '20px 20px 0 0',
        padding: '12px 20px 32px',
        zIndex: 9999,
        maxHeight: '88vh', overflowY: 'auto',
        animation: 'sakinahSlideUp 0.3s ease',
    }

    const sectionStyle = {
        borderTop: '1px solid var(--glass-border)',
        paddingTop: 18, marginTop: 18,
    }

    const labelStyle = {
        color: 'var(--text-muted)', fontSize: 11,
        fontWeight: 600, letterSpacing: '0.08em',
        textTransform: 'uppercase', marginBottom: 8,
        display: 'block',
    }

    const inputStyle = {
        width: '100%', padding: '11px 14px',
        background: 'var(--bg-card)', border: '1px solid var(--glass-border)',
        borderRadius: 10, color: 'var(--text-primary)',
        fontSize: 14, outline: 'none',
        fontFamily: 'inherit',
        transition: 'border-color 0.2s',
    }

    const personaBtnStyle = (active) => ({
        flex: 1, padding: '10px 4px',
        borderRadius: 10,
        border: `1px solid ${active ? 'var(--accent)' : 'var(--glass-border)'}`,
        background: active ? 'rgba(201,169,110,0.12)' : 'transparent',
        color: active ? 'var(--accent)' : 'var(--text-secondary)',
        fontSize: 11, fontWeight: active ? 700 : 500,
        cursor: 'pointer', textAlign: 'center',
        transition: 'all 0.2s ease',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', gap: 3,
    })

    const toggleBtnStyle = (active) => ({
        flex: 1, padding: '10px 0',
        borderRadius: 10,
        border: `1px solid ${active ? 'var(--accent)' : 'var(--glass-border)'}`,
        background: active ? 'rgba(201,169,110,0.12)' : 'transparent',
        color: active ? 'var(--accent)' : 'var(--text-secondary)',
        fontSize: 13, fontWeight: active ? 700 : 500,
        cursor: 'pointer', transition: 'all 0.2s ease',
    })

    return (
        <>
            <div style={overlayStyle} onClick={onClose} />
            <div style={sheetStyle}>
                {/* Handle bar */}
                <div style={{ width: 40, height: 4, background: 'var(--glass-border)', borderRadius: 2, margin: '0 auto 20px' }} />

                {/* Title */}
                <h2 style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: 20, fontWeight: 700,
                    color: 'var(--text-primary)', marginBottom: 20,
                }}>
                    {t('settingsTitle')}
                </h2>

                {/* Email (read-only) */}
                <div style={{ marginBottom: 16 }}>
                    <label style={labelStyle}>{t('settingsEmail')}</label>
                    <div style={{ ...inputStyle, color: 'var(--text-muted)', cursor: 'default' }}>
                        {user?.email}
                    </div>
                </div>

                {/* Display name */}
                <div style={{ marginBottom: 4 }}>
                    <label style={labelStyle}>{t('settingsName')}</label>
                    <input
                        style={inputStyle}
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder={t('settingsNamePlaceholder')}
                        onFocus={e => e.currentTarget.style.borderColor = 'var(--accent)'}
                        onBlur={e => e.currentTarget.style.borderColor = 'var(--glass-border)'}
                    />
                </div>

                {/* Preferred persona */}
                <div style={sectionStyle}>
                    <label style={labelStyle}>{t('settingsPersona')}</label>
                    <div style={{ display: 'flex', gap: 6 }}>
                        {Object.values(PERSONAS).map(p => (
                            <button
                                key={p.key}
                                style={personaBtnStyle(persona === p.key)}
                                onClick={() => setPersona(p.key)}
                            >
                                <span style={{ fontSize: 18 }}>{p.emoji}</span>
                                <span>{lang === 'bm' ? p.labelBM : p.labelEN}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Language */}
                <div style={sectionStyle}>
                    <label style={labelStyle}>{t('settingsLanguage')}</label>
                    <div style={{ display: 'flex', gap: 8 }}>
                        <button style={toggleBtnStyle(lang === 'bm')} onClick={() => setLang('bm')}>
                            {t('settingsLangBM')}
                        </button>
                        <button style={toggleBtnStyle(lang === 'en')} onClick={() => setLang('en')}>
                            {t('settingsLangEN')}
                        </button>
                    </div>
                </div>

                {/* Theme */}
                <div style={sectionStyle}>
                    <label style={labelStyle}>{t('settingsTheme')}</label>
                    <div style={{ display: 'flex', gap: 8 }}>
                        <button style={toggleBtnStyle(theme === 'dark')} onClick={() => setTheme('dark')}>
                            🌙 {t('settingsThemeDark')}
                        </button>
                        <button style={toggleBtnStyle(theme === 'light')} onClick={() => setTheme('light')}>
                            ☀️ {t('settingsThemeLight')}
                        </button>
                    </div>
                </div>

                {/* Save button */}
                <div style={{ ...sectionStyle, border: 'none', paddingTop: 10 }}>
                    {saveError && (
                        <p style={{ color: 'var(--error)', fontSize: 13, marginBottom: 10 }}>{saveError}</p>
                    )}
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        style={{
                            width: '100%', padding: '13px 0',
                            background: saved ? '#4ade80' : 'var(--accent-gradient)',
                            color: 'white', fontWeight: 700, fontSize: 15,
                            borderRadius: 12, border: 'none', cursor: 'pointer',
                            transition: 'all 0.2s ease', marginBottom: 10,
                            opacity: saving ? 0.7 : 1,
                        }}
                    >
                        {saved ? '✓ ' + t('settingsSaved') : saving ? t('loading') : t('settingsSaveBtn')}
                    </button>

                    <button
                        onClick={handleTriggerOnboarding}
                        style={{
                            width: '100%', padding: '11px 0',
                            background: 'transparent', border: '1px solid var(--glass-border)',
                            color: 'var(--text-secondary)', fontSize: 14,
                            borderRadius: 10, cursor: 'pointer', marginBottom: 10,
                        }}
                        onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
                        onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--glass-border)'}
                    >
                        🎓 {t('settingsTutorial')}
                    </button>

                    <button
                        onClick={() => setShowLogoutConfirm(true)}
                        style={{
                            width: '100%', padding: '11px 0',
                            background: 'transparent', border: '1px solid rgba(248,113,113,0.3)',
                            color: '#f87171', fontSize: 14,
                            borderRadius: 10, cursor: 'pointer',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(248,113,113,0.08)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                        {t('settingsLogout')}
                    </button>
                </div>
            </div>

            {showLogoutConfirm && (
                <ConfirmModal
                    message={t('settingsLogoutConfirm')}
                    confirmLabel={t('yes')}
                    cancelLabel={t('cancel')}
                    onConfirm={handleLogout}
                    onCancel={() => setShowLogoutConfirm(false)}
                    danger
                />
            )}
        </>
    )
}
