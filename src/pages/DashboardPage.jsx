// Sakinah سكينة — Dashboard Page (full inline styles)
// Shows: prayer times, daily ayah, daily hadith, journal stats, recent entries

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import { usePrayerTimes } from '../hooks/usePrayerTimes'
import { useDailyContent } from '../hooks/useDailyContent'
import { useDashboard } from '../hooks/useDashboard'
import Navbar from '../components/Navbar'
import { SkeletonCard } from '../components/SkeletonLoader'
import OnboardingTutorial from '../components/OnboardingTutorial'

const PRAYER_KEYS = {
    Fajr: 'prayerSubuh',
    Sunrise: 'prayerSyuruk',
    Dhuhr: 'prayerZohor',
    Asr: 'prayerAsar',
    Maghrib: 'prayerMaghrib',
    Isha: 'prayerIsyak',
}

function formatBMDate(dateStr) {
    const BM_MONTHS = ['Januari', 'Februari', 'Mac', 'April', 'Mei', 'Jun', 'Julai', 'Ogos', 'September', 'Oktober', 'November', 'Disember']
    const d = new Date(dateStr)
    return `${d.getDate()} ${BM_MONTHS[d.getMonth()]} ${d.getFullYear()}`
}

function truncate(text, len = 120) {
    if (!text || text.length <= len) return text
    return text.slice(0, len).trimEnd() + '…'
}

function StatCard({ label, value, sub, gradient }) {
    return (
        <div style={{
            background: gradient || 'var(--bg-card)',
            borderRadius: 14, padding: '16px 14px',
            boxShadow: 'var(--shadow)',
        }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: 'white', lineHeight: 1 }}>{value}</div>
            <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: 12, fontWeight: 700, marginTop: 4 }}>{label}</div>
            <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11, marginTop: 2 }}>{sub}</div>
        </div>
    )
}

export default function DashboardPage() {
    const { user, profile } = useAuth()
    const { lang, t } = useLanguage()
    const navigate = useNavigate()
    const prayer = usePrayerTimes()
    const { ayah, hadith, loading: dailyLoading } = useDailyContent()
    const { stats, entriesByDay, loading: dashLoading } = useDashboard(user?.id)
    const [showOnboarding, setShowOnboarding] = useState(
        localStorage.getItem('sakinah_onboarded') !== 'true'
    )

    const displayName = profile?.name || user?.email?.split('@')[0] || 'Sahabat'

    function greeting() {
        const h = new Date().getHours()
        if (h < 12) return t('dashGreetingMorning')
        if (h < 17) return t('dashGreetingAfternoon')
        return t('dashGreetingEvening')
    }

    const pageStyle = {
        minHeight: '100vh', background: 'var(--bg-primary)',
        display: 'flex', flexDirection: 'column',
    }

    const mainStyle = {
        flex: 1, maxWidth: 480, margin: '0 auto',
        padding: '20px 16px 40px', width: '100%',
    }

    const cardStyle = {
        background: 'var(--bg-card)',
        backdropFilter: 'blur(20px)',
        border: '1px solid var(--glass-border)',
        borderRadius: 18, boxShadow: 'var(--shadow)',
    }

    const sectionTitle = {
        fontFamily: "'Playfair Display', serif",
        fontSize: 16, fontWeight: 700,
        color: 'var(--text-primary)', marginBottom: 2,
    }

    return (
        <div style={pageStyle}>
            <Navbar />
            <main style={mainStyle}>
                {/* Greeting */}
                <div style={{ marginBottom: 20, animation: 'sakinahSlideUp 0.4s ease' }}>
                    <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>{greeting()},</p>
                    <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', marginTop: 2 }}>
                        {displayName} 👋
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 4 }}>
                        {stats?.totalEntries
                            ? t('dashSubtitleEntries')(stats.totalEntries)
                            : t('dashSubtitleStart')}
                    </p>
                </div>

                {/* Prayer Times Card */}
                <div style={{ ...cardStyle, padding: '20px 18px', marginBottom: 16, animation: 'sakinahSlideUp 0.5s ease' }}>
                    <h2 style={sectionTitle}>🕌 {t('prayerTitle')}</h2>
                    {prayer.loading ? (
                        <SkeletonCard height={80} style={{ marginTop: 12 }} />
                    ) : prayer.error ? (
                        <div style={{ marginTop: 12 }}>
                            <p style={{ color: 'var(--error)', fontSize: 13 }}>⚠️ {t('prayerError')}</p>
                            <button onClick={prayer.retry} style={{ marginTop: 8, background: 'var(--accent-gradient)', border: 'none', color: 'white', padding: '7px 16px', borderRadius: 8, fontSize: 13, cursor: 'pointer' }}>
                                {t('prayerRetry')}
                            </button>
                        </div>
                    ) : prayer.needsManualSelection ? (
                        <div style={{ marginTop: 12 }}>
                            <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 8 }}>{t('prayerGPSDenied')}</p>
                            <select
                                value={prayer.selectedState || ''}
                                onChange={e => prayer.setSelectedState(e.target.value)}
                                style={{
                                    width: '100%', padding: '10px 12px',
                                    background: 'var(--bg-card)', border: '1px solid var(--glass-border)',
                                    borderRadius: 10, color: 'var(--text-primary)',
                                    fontSize: 14, outline: 'none', fontFamily: 'inherit', cursor: 'pointer',
                                }}
                            >
                                <option value="" disabled>{t('prayerSelectStatePlaceholder')}</option>
                                {prayer.stateList.map(state => (
                                    <option key={state} value={state}>{state}</option>
                                ))}
                            </select>
                        </div>
                    ) : prayer.timings ? (
                        <>
                            {/* Next prayer countdown */}
                            {prayer.nextPrayer && (
                                <div style={{
                                    background: 'rgba(201,169,110,0.1)', border: '1px solid rgba(201,169,110,0.2)',
                                    borderRadius: 12, padding: '10px 14px', marginTop: 12, marginBottom: 12,
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                }}>
                                    <div>
                                        <p style={{ color: 'var(--text-muted)', fontSize: 11 }}>{t('prayerNext')}</p>
                                        <p style={{ color: 'var(--accent)', fontWeight: 700, fontSize: 15 }}>
                                            {lang === 'bm' ? prayer.prayerBMNames[prayer.nextPrayer] : prayer.nextPrayer}
                                        </p>
                                    </div>
                                    <p style={{ color: 'var(--accent)', fontFamily: 'monospace', fontSize: 19, fontWeight: 800 }}>
                                        {prayer.countdown}
                                    </p>
                                </div>
                            )}
                            {/* Prayer times grid */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                                {prayer.prayerOrder.map(name => {
                                    const timeStr = prayer.timings[name] || '--:--'
                                    const displayTime = timeStr.split(' ')[0]
                                    const isNext = prayer.nextPrayer === name
                                    return (
                                        <div key={name} style={{
                                            background: isNext ? 'rgba(201,169,110,0.12)' : 'rgba(255,255,255,0.03)',
                                            border: `1px solid ${isNext ? 'rgba(201,169,110,0.3)' : 'var(--glass-border)'}`,
                                            borderRadius: 10, padding: '8px 10px', textAlign: 'center',
                                        }}>
                                            <p style={{ color: isNext ? 'var(--accent)' : 'var(--text-muted)', fontSize: 10, fontWeight: 600, marginBottom: 2 }}>
                                                {lang === 'bm' ? prayer.prayerBMNames[name] : name}
                                            </p>
                                            <p style={{ color: isNext ? 'var(--accent)' : 'var(--text-primary)', fontSize: 13, fontWeight: 700 }}>
                                                {displayTime}
                                            </p>
                                        </div>
                                    )
                                })}
                            </div>
                        </>
                    ) : null}
                </div>

                {/* Daily Ayah */}
                <div style={{ ...cardStyle, padding: '20px 18px', marginBottom: 16, animation: 'sakinahSlideUp 0.55s ease' }}>
                    <h2 style={sectionTitle}>📖 {t('ayahTitle')}</h2>
                    {dailyLoading ? (
                        <SkeletonCard height={90} style={{ marginTop: 12 }} />
                    ) : ayah ? (
                        <div style={{ marginTop: 12 }}>
                            <p style={{
                                fontFamily: "'Noto Naskh Arabic', serif",
                                fontSize: 20, direction: 'rtl', textAlign: 'right',
                                color: 'var(--accent)', lineHeight: 2,
                                marginBottom: 12,
                            }}>
                                {ayah.arabic}
                            </p>
                            <p style={{ color: 'var(--text-secondary)', fontSize: 13, lineHeight: 1.7, marginBottom: 6 }}>
                                {lang === 'bm' ? ayah.malay : ayah.malay}
                            </p>
                            <p style={{ color: 'var(--text-muted)', fontSize: 11 }}>
                                — {lang === 'bm' ? ayah.referenceBm : ayah.referenceEn}
                            </p>
                        </div>
                    ) : null}
                </div>

                {/* Daily Hadith */}
                {hadith && (
                    <div style={{ ...cardStyle, padding: '20px 18px', marginBottom: 16, animation: 'sakinahSlideUp 0.6s ease' }}>
                        <h2 style={sectionTitle}>🌿 {t('hadithTitle')}</h2>
                        <p style={{
                            fontFamily: "'Noto Naskh Arabic', serif",
                            fontSize: 17, direction: 'rtl', textAlign: 'right',
                            color: 'var(--accent)', lineHeight: 2, marginTop: 12, marginBottom: 12,
                        }}>
                            {hadith.arabic}
                        </p>
                        <p style={{ color: 'var(--text-secondary)', fontSize: 13, lineHeight: 1.7, marginBottom: 8 }}>
                            {lang === 'bm' ? hadith.malay : hadith.english}
                        </p>
                        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 4 }}>
                            <p style={{ color: 'var(--text-muted)', fontSize: 11 }}>
                                {lang === 'bm' ? hadith.narrator_bm : hadith.narrator_en}
                            </p>
                            <p style={{ color: 'var(--text-muted)', fontSize: 11 }}>
                                {lang === 'bm' ? hadith.source_bm : hadith.source_en}
                            </p>
                        </div>
                    </div>
                )}

                {/* Stats */}
                {!dashLoading && stats && (
                    <div style={{ marginBottom: 16, animation: 'sakinahSlideUp 0.65s ease' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                            <StatCard label={t('dashTotalEntries')} value={stats.totalEntries ?? 0} sub={t('dashEntriesSub')} gradient="linear-gradient(135deg, #C9A96E, #a88040)" />
                            <StatCard label={t('dashStreak')} value={stats.streak ?? 0} sub={t('dashStreakSub')(stats.streak ?? 0)} gradient="linear-gradient(135deg, #f97316, #ef4444)" />
                            <StatCard label={t('dashDaysActive')} value={stats.daysActive ?? 0} sub={t('dashDaysActiveSub')(stats.firstEntry ? (lang === 'bm' ? formatBMDate(stats.firstEntry) : new Date(stats.firstEntry).toLocaleDateString()) : t('dashNoDate'))} gradient="linear-gradient(135deg, #6366f1, #4f46e5)" />
                            <StatCard label={t('dashTotalAI')} value={stats.totalAiReplies ?? 0} sub={t('dashAISub')} gradient="linear-gradient(135deg, #10b981, #059669)" />
                        </div>
                    </div>
                )}

                {/* Recent Entries */}
                <div style={{ animation: 'sakinahSlideUp 0.7s ease' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                        <h2 style={{ ...sectionTitle, marginBottom: 0 }}>{t('dashJournalEntries')}</h2>
                        <button
                            onClick={() => navigate('/journal')}
                            style={{ background: 'transparent', border: '1px solid var(--glass-border)', color: 'var(--text-secondary)', padding: '6px 14px', borderRadius: 8, fontSize: 12, cursor: 'pointer' }}
                            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
                            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--glass-border)'}
                        >
                            {t('dashOpenJournal')}
                        </button>
                    </div>

                    {dashLoading ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {[1, 2].map(i => <SkeletonCard key={i} height={80} />)}
                        </div>
                    ) : entriesByDay.length === 0 ? (
                        <div style={{ ...cardStyle, padding: '28px 20px', textAlign: 'center' }}>
                            <p style={{ fontSize: 32, marginBottom: 10 }}>📔</p>
                            <p style={{ color: 'var(--text-primary)', fontWeight: 700, marginBottom: 6 }}>{t('dashNoEntries')}</p>
                            <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>{t('dashNoEntriesSub')}</p>
                            <button
                                onClick={() => navigate('/journal')}
                                style={{ marginTop: 16, background: 'var(--accent-gradient)', border: 'none', color: 'white', padding: '10px 24px', borderRadius: 10, fontWeight: 700, cursor: 'pointer' }}
                            >
                                {t('dashWriteFirst')}
                            </button>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {entriesByDay.slice(0, 3).map(day => {
                                const latest = day.entries[0]
                                return (
                                    <div
                                        key={day.date}
                                        onClick={() => navigate('/journal')}
                                        style={{ ...cardStyle, padding: '14px 16px', cursor: 'pointer', transition: 'all 0.2s ease' }}
                                        onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(201,169,110,0.4)'}
                                        onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--glass-border)'}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                                            <span style={{ background: 'rgba(201,169,110,0.12)', color: 'var(--accent)', fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20 }}>
                                                {day.label}
                                            </span>
                                            {latest.mood && <span style={{ fontSize: 16 }}>{['', '😞', '😟', '😐', '🙂', '😊'][latest.mood]}</span>}
                                        </div>
                                        <p style={{ color: 'var(--text-secondary)', fontSize: 13, lineHeight: 1.5 }}>
                                            {truncate(latest.content)}
                                        </p>
                                        {latest.tags?.length > 0 && (
                                            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 8 }}>
                                                {latest.tags.map(tag => (
                                                    <span key={tag} style={{ background: 'rgba(201,169,110,0.1)', color: 'var(--accent)', fontSize: 10, padding: '2px 8px', borderRadius: 20, border: '1px solid rgba(201,169,110,0.2)' }}>
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            </main>

            {showOnboarding && <OnboardingTutorial onComplete={() => setShowOnboarding(false)} />}
        </div>
    )
}
