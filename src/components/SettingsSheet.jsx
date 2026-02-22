// Sakinah — Settings Sheet (Stoic style)

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
    const [showLogout, setShowLogout] = useState(false)

    useEffect(() => {
        if (profile) { setName(profile.name || ''); setPersona(profile.preferred_persona || 'balanced') }
    }, [profile])

    async function handleSave() {
        setSaving(true); setSaveError(null)
        try {
            await updateProfile({ name, preferred_persona: persona, preferred_lang: lang })
            setSaved(true); setTimeout(() => setSaved(false), 2000)
        } catch (err) { setSaveError(err.message) }
        finally { setSaving(false) }
    }

    async function handleLogout() { await signOut(); onClose() }

    const row = { marginBottom: 24 }
    const label = { color: 'var(--text-sub)', fontSize: 12, marginBottom: 8, display: 'block', fontFamily: 'Noto Sans, sans-serif' }
    const input = {
        width: '100%', padding: '13px 14px',
        background: 'var(--surface)', border: '0.5px solid var(--border)',
        borderRadius: 10, color: 'var(--text)',
        fontSize: 15, outline: 'none', fontFamily: 'Noto Sans, sans-serif',
        transition: 'border-color 0.2s',
    }

    return (
        <>
            <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 9990, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', animation: 'fadeIn 0.2s ease' }} />
            <div style={{
                position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
                width: '100%', maxWidth: 480,
                background: 'var(--card)', borderRadius: '20px 20px 0 0',
                padding: '12px 24px', paddingBottom: 'calc(24px + env(safe-area-inset-bottom, 0px))',
                zIndex: 9991, maxHeight: '90vh', overflowY: 'auto',
                animation: 'slideUpSheet 0.3s ease',
            }}>
                <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--border)', margin: '0 auto 24px' }} />
                <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 600, color: 'var(--text)', marginBottom: 28 }}>
                    {t('settingsTitle')}
                </h2>

                {/* Email */}
                <div style={{ ...row, marginBottom: 16 }}>
                    <span style={label}>{t('settingsEmail')}</span>
                    <div style={{ ...input, color: 'var(--text-muted)', cursor: 'default' }}>{user?.email}</div>
                </div>

                {/* Name */}
                <div style={row}>
                    <span style={label}>{t('settingsName')}</span>
                    <input value={name} onChange={e => setName(e.target.value)}
                        placeholder={t('settingsNamePlaceholder')} style={input}
                        onFocus={e => e.currentTarget.style.borderColor = 'var(--gold)'}
                        onBlur={e => e.currentTarget.style.borderColor = 'var(--border)'} />
                </div>

                {/* Persona */}
                <div style={row}>
                    <span style={label}>{t('settingsPersona')}</span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {Object.values(PERSONAS).map(p => {
                            const active = persona === p.key
                            return (
                                <button key={p.key} onClick={() => setPersona(p.key)} style={{
                                    padding: '12px 14px', borderRadius: 10, textAlign: 'left',
                                    border: `0.5px solid ${active ? 'var(--gold)' : 'var(--border)'}`,
                                    background: 'var(--surface)', cursor: 'pointer',
                                    fontFamily: 'Noto Sans, sans-serif',
                                }}>
                                    <span style={{ color: active ? 'var(--gold)' : 'var(--text)', fontWeight: active ? 600 : 400, fontSize: 14 }}>
                                        {lang === 'bm' ? p.labelBM : p.labelEN}
                                    </span>
                                </button>
                            )
                        })}
                    </div>
                </div>

                {/* Language */}
                <div style={row}>
                    <span style={label}>{t('settingsLanguage')}</span>
                    <div style={{ display: 'flex', gap: 8 }}>
                        {[['bm', t('settingsLangBM')], ['en', t('settingsLangEN')]].map(([val, lbl]) => (
                            <button key={val} onClick={() => setLang(val)} style={{
                                flex: 1, padding: '12px 0', borderRadius: 10,
                                border: `0.5px solid ${lang === val ? 'var(--gold)' : 'var(--border)'}`,
                                background: 'var(--surface)', cursor: 'pointer',
                                color: lang === val ? 'var(--gold)' : 'var(--text-sub)',
                                fontWeight: lang === val ? 600 : 400, fontSize: 14,
                                fontFamily: 'Noto Sans, sans-serif',
                            }}>{lbl}</button>
                        ))}
                    </div>
                </div>

                {/* Theme */}
                <div style={row}>
                    <span style={label}>{t('settingsTheme')}</span>
                    <div style={{ display: 'flex', gap: 8 }}>
                        {[['dark', t('settingsThemeDark')], ['light', t('settingsThemeLight')]].map(([val, lbl]) => (
                            <button key={val} onClick={() => setTheme(val)} style={{
                                flex: 1, padding: '12px 0', borderRadius: 10,
                                border: `0.5px solid ${theme === val ? 'var(--gold)' : 'var(--border)'}`,
                                background: 'var(--surface)', cursor: 'pointer',
                                color: theme === val ? 'var(--gold)' : 'var(--text-sub)',
                                fontWeight: theme === val ? 600 : 400, fontSize: 14,
                                fontFamily: 'Noto Sans, sans-serif',
                            }}>{lbl}</button>
                        ))}
                    </div>
                </div>

                {saveError && <p style={{ color: 'var(--error)', fontSize: 13, marginBottom: 12 }}>{saveError}</p>}

                <button onClick={handleSave} disabled={saving} style={{
                    width: '100%', padding: '15px 0', borderRadius: 12, border: 'none',
                    background: saved ? 'var(--success)' : 'var(--gold)',
                    color: '#1A160B', fontWeight: 600, fontSize: 15,
                    cursor: 'pointer', marginBottom: 12, fontFamily: 'Noto Sans, sans-serif',
                    opacity: saving ? 0.7 : 1, transition: 'background 0.3s ease',
                }}>
                    {saved ? '✓ ' + t('settingsSaved') : saving ? '...' : t('settingsSaveBtn')}
                </button>

                <button onClick={() => setShowLogout(true)} style={{
                    width: '100%', padding: '15px 0', borderRadius: 12,
                    border: '0.5px solid var(--border)', background: 'transparent',
                    color: 'var(--error)', fontSize: 15, cursor: 'pointer',
                    fontFamily: 'Noto Sans, sans-serif',
                }}>
                    {t('settingsLogout')}
                </button>
            </div>

            {showLogout && (
                <ConfirmModal message={t('settingsLogoutConfirm')} confirmLabel={t('yes')} cancelLabel={t('cancel')}
                    onConfirm={handleLogout} onCancel={() => setShowLogout(false)} danger />
            )}
        </>
    )
}
