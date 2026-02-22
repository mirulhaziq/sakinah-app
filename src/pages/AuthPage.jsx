// Sakinah سكينة — Auth Page (full inline styles)

import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'

const ISLAMIC_QUOTES = [
    { ar: "إِنَّ مَعَ الْعُسْرِ يُسْرًا", ref: "al-Inshirah 94:6", bm: "Sesungguhnya bersama kesulitan itu ada kemudahan.", en: "Indeed, with hardship comes ease." },
    { ar: "وَتَوَكَّلْ عَلَى اللَّهِ وَكَفَىٰ بِاللَّهِ وَكِيلًا", ref: "al-Ahzab 33:3", bm: "Dan bertawakkallah kepada Allah, dan cukuplah Allah sebagai Pelindung.", en: "And put your trust in Allah, and Allah is sufficient as a Disposer of affairs." },
    { ar: "فَاذْكُرُونِي أَذْكُرْكُمْ", ref: "al-Baqarah 2:152", bm: "Maka ingatlah kamu kepada-Ku, nescaya Aku ingat kepadamu.", en: "So remember Me; I will remember you." },
    { ar: "وَهُوَ مَعَكُمْ أَيْنَ مَا كُنتُمْ", ref: "al-Hadid 57:4", bm: "Dan Dia bersama kamu di mana saja kamu berada.", en: "And He is with you wherever you are." },
]
const DAILY_QUOTE = ISLAMIC_QUOTES[new Date().getDay() % ISLAMIC_QUOTES.length]

export default function AuthPage() {
    const [mode, setMode] = useState('login')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPass, setShowPass] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [success, setSuccess] = useState(null)
    const { signIn, signUp } = useAuth()
    const { lang, t, setLang } = useLanguage()

    async function handleSubmit(e) {
        e.preventDefault()
        setError(null); setSuccess(null)
        if (!email.trim() || !password.trim()) { setError(t('authErrorEmpty')); return }
        if (password.length < 6) { setError(t('authErrorShortPass')); return }
        setLoading(true)
        try {
            if (mode === 'signup') {
                await signUp(email, password)
                setSuccess(t('authSuccessSignup'))
                setMode('login')
            } else {
                await signIn(email, password)
            }
        } catch (err) {
            setError(err.message || t('authErrorGeneric'))
        } finally {
            setLoading(false)
        }
    }

    const pageStyle = {
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '24px 20px', background: 'var(--bg-primary)',
        position: 'relative', overflow: 'hidden',
    }

    const orbStyle = (top, left, size, color) => ({
        position: 'absolute', borderRadius: '50%',
        width: size, height: size, top, left,
        background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
        filter: 'blur(40px)', pointerEvents: 'none', zIndex: 0,
    })

    const cardStyle = {
        background: 'var(--bg-card)',
        backdropFilter: 'blur(32px)',
        WebkitBackdropFilter: 'blur(32px)',
        border: '1px solid var(--glass-border)',
        borderRadius: 24, padding: '36px 28px',
        width: '100%', maxWidth: 420,
        boxShadow: 'var(--shadow-lg)',
        position: 'relative', zIndex: 1,
        animation: 'sakinahSlideUp 0.4s ease',
    }

    const inputStyle = {
        width: '100%', padding: '12px 14px',
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid var(--glass-border)',
        borderRadius: 10, color: 'var(--text-primary)',
        fontSize: 15, outline: 'none', fontFamily: 'inherit',
        transition: 'border-color 0.2s, box-shadow 0.2s',
    }

    return (
        <div style={pageStyle}>
            {/* Background orbs */}
            <div style={orbStyle('-10%', '-10%', '50vw', 'rgba(201,169,110,0.06)')} />
            <div style={orbStyle('60%', '60%', '40vw', 'rgba(201,169,110,0.04)')} />

            {/* Lang toggle */}
            <div style={{ position: 'absolute', top: 16, right: 16, zIndex: 10 }}>
                <button
                    onClick={() => setLang(lang === 'bm' ? 'en' : 'bm')}
                    style={{
                        background: 'var(--bg-card)', border: '1px solid var(--glass-border)',
                        borderRadius: 20, padding: '5px 14px',
                        color: 'var(--text-secondary)', fontSize: 12, fontWeight: 600,
                        cursor: 'pointer', backdropFilter: 'blur(8px)',
                    }}
                >
                    {t('navLangToggle')}
                </button>
            </div>

            {/* Logo area */}
            <div style={{ textAlign: 'center', marginBottom: 28, zIndex: 1 }}>
                <h1 style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: 36, fontWeight: 800,
                    color: 'var(--accent)', letterSpacing: '-0.03em', marginBottom: 4,
                }}>
                    Sakinah
                </h1>
                <p style={{ fontFamily: "'Noto Naskh Arabic', serif", fontSize: 20, color: 'var(--text-muted)', direction: 'rtl' }}>
                    سكينة
                </p>
                <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 6 }}>{t('appTagline')}</p>
            </div>

            {/* Daily Quran quote card */}
            <div style={{
                background: 'rgba(201,169,110,0.06)', border: '1px solid rgba(201,169,110,0.15)',
                borderRadius: 16, padding: '16px 20px', marginBottom: 24,
                maxWidth: 380, width: '100%', zIndex: 1,
                textAlign: 'right',
            }}>
                <p style={{ fontFamily: "'Noto Naskh Arabic', serif", fontSize: 18, color: 'var(--accent)', direction: 'rtl', marginBottom: 8, lineHeight: 1.8 }}>
                    {DAILY_QUOTE.ar}
                </p>
                <p style={{ color: 'var(--text-secondary)', fontSize: 13, textAlign: 'left', lineHeight: 1.5 }}>
                    {lang === 'bm' ? DAILY_QUOTE.bm : DAILY_QUOTE.en}
                </p>
                <p style={{ color: 'var(--text-muted)', fontSize: 11, textAlign: 'left', marginTop: 4 }}>— {DAILY_QUOTE.ref}</p>
            </div>

            {/* Form card */}
            <div style={cardStyle}>
                <h2 style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: 22, fontWeight: 700,
                    color: 'var(--text-primary)', marginBottom: 6,
                }}>
                    {mode === 'login' ? t('authWelcomeBack') : t('authStartJourney')}
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 24 }}>
                    {mode === 'login' ? t('authSubtitleLogin') : t('authSubtitleSignup')}
                </p>

                {error && (
                    <div style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: 10, padding: '10px 14px', marginBottom: 16, color: 'var(--error)', fontSize: 13 }}>
                        ⚠️ {error}
                    </div>
                )}
                {success && (
                    <div style={{ background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.3)', borderRadius: 10, padding: '10px 14px', marginBottom: 16, color: '#4ade80', fontSize: 13 }}>
                        ✅ {success}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: 14 }}>
                        <label style={{ color: 'var(--text-secondary)', fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>{t('authEmail')}</label>
                        <input
                            type="email" value={email} onChange={e => setEmail(e.target.value)}
                            placeholder={t('authEmailPlaceholder')} autoComplete="email" disabled={loading}
                            style={inputStyle}
                            onFocus={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(201,169,110,0.15)' }}
                            onBlur={e => { e.currentTarget.style.borderColor = 'var(--glass-border)'; e.currentTarget.style.boxShadow = 'none' }}
                        />
                    </div>

                    <div style={{ marginBottom: 24 }}>
                        <label style={{ color: 'var(--text-secondary)', fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>{t('authPassword')}</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type={showPass ? 'text' : 'password'} value={password}
                                onChange={e => setPassword(e.target.value)}
                                placeholder={t('authPasswordPlaceholder')}
                                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                                disabled={loading} style={{ ...inputStyle, paddingRight: 44 }}
                                onFocus={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(201,169,110,0.15)' }}
                                onBlur={e => { e.currentTarget.style.borderColor = 'var(--glass-border)'; e.currentTarget.style.boxShadow = 'none' }}
                            />
                            <button
                                type="button" onClick={() => setShowPass(!showPass)} tabIndex={-1}
                                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 18 }}
                            >
                                {showPass ? '🙈' : '👁'}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit" disabled={loading}
                        style={{
                            width: '100%', padding: '13px 0',
                            background: loading ? 'var(--bg-card)' : 'var(--accent-gradient)',
                            color: 'white', fontWeight: 700, fontSize: 16,
                            borderRadius: 12, border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                            transition: 'opacity 0.2s', opacity: loading ? 0.7 : 1,
                        }}
                        onMouseEnter={e => { if (!loading) e.currentTarget.style.opacity = '0.88' }}
                        onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                    >
                        {loading ? <LoadingDots /> : (mode === 'login' ? t('authSignIn') : t('authCreateAccount'))}
                    </button>
                </form>

                <p style={{ color: 'var(--text-muted)', fontSize: 13, textAlign: 'center', marginTop: 20 }}>
                    {mode === 'login' ? t('authNoAccount') : t('authHaveAccount')}
                    <button
                        onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(null); setSuccess(null) }}
                        style={{ background: 'none', border: 'none', color: 'var(--accent)', fontWeight: 700, cursor: 'pointer', fontSize: 13 }}
                    >
                        {mode === 'login' ? t('authSignUp') : t('authSignIn')}
                    </button>
                </p>
            </div>
        </div>
    )
}

function LoadingDots() {
    return (
        <span style={{ display: 'inline-flex', gap: 4, alignItems: 'center' }}>
            {[0, 1, 2].map(i => (
                <span key={i} style={{
                    width: 6, height: 6, borderRadius: '50%', background: 'white',
                    animation: 'sakinahBounce 1.2s infinite',
                    animationDelay: `${i * 0.2}s`, display: 'inline-block',
                }} />
            ))}
        </span>
    )
}
