// Sakinah — Auth Page (Stoic style)
// Clean form, no tab switcher, lantern logo, Noto Sans

import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import { useTheme } from '../context/ThemeContext'

const QUOTES = [
    { ar: 'إِنَّ مَعَ الْعُسْرِ يُسْرًا', en: 'Indeed, with hardship comes ease.', bm: 'Sesungguhnya bersama kesulitan itu ada kemudahan.', ref: 'Al-Inshirah 94:6' },
    { ar: 'وَهُوَ مَعَكُمْ أَيْنَ مَا كُنتُمْ', en: 'He is with you wherever you are.', bm: 'Dia bersama kamu di mana sahaja kamu berada.', ref: 'Al-Hadid 57:4' },
    { ar: 'حَسْبِيَ اللَّهُ وَنِعْمَ الْوَكِيلُ', en: 'Allah is sufficient for me, and He is the best disposer of affairs.', bm: 'Allah cukup bagiku dan Dialah sebaik-baik Penjaga.', ref: 'Ali Imran 3:173' },
]
const quote = QUOTES[new Date().getDate() % QUOTES.length]

function LanternSVG() {
    return (
        <svg width="52" height="52" viewBox="0 0 24 24" fill="none"
            stroke="var(--gold)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 2h6l1 4H8z" />
            <rect x="7" y="6" width="10" height="12" rx="2" />
            <path d="M7 18l-2 4h14l-2-4" />
            <circle cx="12" cy="12" r="2" fill="var(--gold)" stroke="none" />
        </svg>
    )
}

export default function AuthPage() {
    const { signIn, signUp } = useAuth()
    const { t, lang, setLang } = useLanguage()
    const { theme } = useTheme()
    const [isLogin, setIsLogin] = useState(true)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [name, setName] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [success, setSuccess] = useState(null)
    const [showPass, setShowPass] = useState(false)

    async function handleSubmit(e) {
        e.preventDefault()
        setError(null); setSuccess(null)
        if (!email || !password) { setError(t('authErrorEmpty')); return }
        if (!isLogin && password.length < 6) { setError(t('authErrorShortPass')); return }
        setLoading(true)
        try {
            if (isLogin) await signIn(email, password)
            else {
                await signUp(email, password, name)
                setSuccess(t('authSuccessSignup'))
                setIsLogin(true)
            }
        } catch (err) {
            setError(err.message || t('authErrorGeneric'))
        } finally { setLoading(false) }
    }

    const inputStyle = {
        width: '100%', padding: '14px 16px',
        background: 'var(--surface)', border: '0.5px solid var(--border)',
        borderRadius: 12, color: 'var(--text)',
        fontSize: 15, outline: 'none', fontFamily: 'Noto Sans, sans-serif',
        transition: 'border-color 0.2s', marginBottom: 12,
    }

    return (
        <div style={{
            minHeight: '100dvh', background: 'var(--bg)',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', animation: 'fadeIn 0.4s ease',
        }}>
            {/* Lang toggle — top right */}
            <button onClick={() => setLang(lang === 'bm' ? 'en' : 'bm')} style={{
                position: 'fixed', top: 'calc(16px + env(safe-area-inset-top, 0px))', right: 20,
                background: 'none', border: '0.5px solid var(--border)',
                borderRadius: 20, padding: '5px 14px',
                color: 'var(--text-sub)', fontSize: 13, cursor: 'pointer',
                fontFamily: 'Noto Sans, sans-serif', zIndex: 10,
            }}>
                {lang === 'bm' ? 'EN' : 'BM'}
            </button>

            {/* Content centered */}
            <div style={{
                width: '100%', maxWidth: 400, padding: '0 28px',
                marginTop: '15vh',
            }}>
                {/* Lantern logo */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 40 }}>
                    <LanternSVG />
                    <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 600, color: 'var(--text)', marginTop: 14 }}>
                        Sakinah
                    </span>
                    <span style={{ fontFamily: "'Noto Naskh Arabic', serif", fontSize: 16, color: 'var(--text-sub)', marginTop: 2 }}>
                        سكينة
                    </span>
                </div>

                {/* Daily quote */}
                <div style={{ marginBottom: 36, textAlign: 'center' }}>
                    <p style={{ fontFamily: "'Noto Naskh Arabic', serif", fontSize: 18, color: 'var(--gold)', marginBottom: 8, direction: 'rtl', lineHeight: 1.8 }}>
                        {quote.ar}
                    </p>
                    <p style={{ color: 'var(--text-sub)', fontSize: 13, lineHeight: 1.6 }}>
                        {lang === 'bm' ? quote.bm : quote.en}
                    </p>
                    <p style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 4 }}>{quote.ref}</p>
                </div>

                {/* Form title */}
                <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 600, color: 'var(--text)', marginBottom: 24 }}>
                    {isLogin ? t('authWelcomeBack') : t('authCreateAccount')}
                </h1>

                {success && (
                    <div style={{ background: 'rgba(74,222,128,0.1)', border: '0.5px solid rgba(74,222,128,0.3)', borderRadius: 10, padding: '12px 14px', marginBottom: 16, color: 'var(--success)', fontSize: 14 }}>
                        {success}
                    </div>
                )}
                {error && (
                    <div style={{ background: 'rgba(248,113,113,0.1)', border: '0.5px solid rgba(248,113,113,0.3)', borderRadius: 10, padding: '12px 14px', marginBottom: 16, color: 'var(--error)', fontSize: 14 }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    {!isLogin && (
                        <input type="text" value={name} onChange={e => setName(e.target.value)}
                            placeholder={t('settingsNamePlaceholder')} style={inputStyle}
                            onFocus={e => e.currentTarget.style.borderColor = 'var(--gold)'}
                            onBlur={e => e.currentTarget.style.borderColor = 'var(--border)'} />
                    )}
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                        placeholder={t('authEmailPlaceholder')} style={inputStyle} autoComplete="email"
                        onFocus={e => e.currentTarget.style.borderColor = 'var(--gold)'}
                        onBlur={e => e.currentTarget.style.borderColor = 'var(--border)'} />

                    {/* Password with show/hide */}
                    <div style={{ position: 'relative', marginBottom: 24 }}>
                        <input type={showPass ? 'text' : 'password'} value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder={t('authPasswordPlaceholder')}
                            style={{ ...inputStyle, marginBottom: 0, paddingRight: 48 }}
                            onFocus={e => e.currentTarget.style.borderColor = 'var(--gold)'}
                            onBlur={e => e.currentTarget.style.borderColor = 'var(--border)'} />
                        <button type="button" onClick={() => setShowPass(s => !s)} style={{
                            position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                            background: 'none', border: 'none', cursor: 'pointer',
                            color: 'var(--text-muted)', fontSize: 13, fontFamily: 'Noto Sans, sans-serif',
                        }}>
                            {showPass ? 'Sembunyi' : 'Papar'}
                        </button>
                    </div>

                    <button type="submit" disabled={loading} style={{
                        width: '100%', padding: '15px 0', borderRadius: 12, border: 'none',
                        background: 'var(--gold)', color: '#1A160B',
                        fontWeight: 600, fontSize: 15, cursor: 'pointer',
                        fontFamily: 'Noto Sans, sans-serif',
                        opacity: loading ? 0.7 : 1,
                    }}>
                        {loading ? '...' : isLogin ? t('authSignIn') : t('authSignUp')}
                    </button>
                </form>

                {/* Switch mode — plain text link */}
                <p style={{ textAlign: 'center', marginTop: 20, color: 'var(--text-sub)', fontSize: 14 }}>
                    {isLogin ? t('authNoAccount') : t('authHaveAccount')}
                    <button onClick={() => { setIsLogin(s => !s); setError(null); setSuccess(null) }} style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: 'var(--text)', fontSize: 14, fontWeight: 500,
                        fontFamily: 'Noto Sans, sans-serif', textDecoration: 'underline',
                        textDecorationColor: 'var(--gold)',
                    }}>
                        {isLogin ? t('authSignUp') : t('authSignIn')}
                    </button>
                </p>
            </div>
        </div>
    )
}
