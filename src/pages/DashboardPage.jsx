// Sakinah — Dashboard Page
// Stoic aesthetic: restrained decoration, full content visibility

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import { usePrayerTimes } from '../hooks/usePrayerTimes'
import { useDailyContent } from '../hooks/useDailyContent'
import { useDashboard } from '../hooks/useDashboard'
import BottomNav from '../components/BottomNav'
import OnboardingTutorial from '../components/OnboardingTutorial'
import SkeletonLoader from '../components/SkeletonLoader'

// State names match keys in usePrayerTimes hook's MALAYSIA_STATES object
const MALAYSIA_STATE_LIST = [
    'Johor', 'Kedah', 'Kelantan', 'Melaka', 'Negeri Sembilan',
    'Pahang', 'Perak', 'Perlis', 'Pulau Pinang', 'Sabah',
    'Sarawak', 'Selangor', 'Terengganu', 'Kuala Lumpur', 'Putrajaya',
]

const MALAYSIA_STATES = [
    { label: 'Johor', value: 'MY-01' }, { label: 'Kedah', value: 'MY-02' },
    { label: 'Kelantan', value: 'MY-03' }, { label: 'Melaka', value: 'MY-04' },
    { label: 'Negeri Sembilan', value: 'MY-05' }, { label: 'Pahang', value: 'MY-06' },
    { label: 'Perak', value: 'MY-08' }, { label: 'Perlis', value: 'MY-09' },
    { label: 'Pulau Pinang', value: 'MY-07' }, { label: 'Sabah', value: 'MY-12' },
    { label: 'Sarawak', value: 'MY-13' }, { label: 'Selangor', value: 'MY-10' },
    { label: 'Terengganu', value: 'MY-11' }, { label: 'W.P. Kuala Lumpur', value: 'MY-14' },
]

const PRAYERS = [
    { key: 'Fajr', labelBM: 'Subuh', labelEN: 'Fajr' },
    { key: 'Sunrise', labelBM: 'Syuruk', labelEN: 'Sunrise' },
    { key: 'Dhuhr', labelBM: 'Zohor', labelEN: 'Dhuhr' },
    { key: 'Asr', labelBM: 'Asar', labelEN: 'Asr' },
    { key: 'Maghrib', labelBM: 'Maghrib', labelEN: 'Maghrib' },
    { key: 'Isha', labelBM: 'Isyak', labelEN: 'Isha' },
]

function getGreetingKey() {
    const h = new Date().getHours()
    if (h < 12) return 'dashGreetingMorning'
    if (h < 17) return 'dashGreetingAfternoon'
    return 'dashGreetingEvening'
}

// Section card with gold left-bar header
function Card({ title, children, action, actionLabel }) {
    return (
        <div style={{ background: 'var(--card)', borderRadius: 16, boxShadow: 'var(--shadow-card)', overflow: 'hidden', marginBottom: 20 }}>
            {/* Header row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 20px 14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 3, height: 18, background: 'var(--gold)', borderRadius: 2, flexShrink: 0 }} />
                    <span style={{ color: 'var(--text)', fontSize: 14, fontWeight: 600, fontFamily: 'Noto Sans, sans-serif', letterSpacing: 0 }}>
                        {title}
                    </span>
                </div>
                {action && (
                    <button onClick={action} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 12, cursor: 'pointer', fontFamily: 'Noto Sans, sans-serif' }}>
                        {actionLabel}
                    </button>
                )}
            </div>
            {/* Divider */}
            <div style={{ height: '0.5px', background: 'var(--border)' }} />
            {/* Content */}
            <div style={{ padding: '20px 20px 22px' }}>{children}</div>
        </div>
    )
}

export default function DashboardPage() {
    const navigate = useNavigate()
    const { user, profile } = useAuth()
    const { t, lang } = useLanguage()
    const { timings, nextPrayer, countdown, loading: prayerLoading, error: prayerError, needsManualSelection, selectedState, setSelectedState, retry: retryPrayer, stateList } = usePrayerTimes()
    const { ayah, hadith, loading: contentLoading } = useDailyContent()
    const { stats, entriesByDay, loading: dashLoading } = useDashboard(user?.id)

    const [showOnboarding, setShowOnboarding] = useState(false)
    useEffect(() => {
        if (!localStorage.getItem('sakinah_onboarded')) setShowOnboarding(true)
    }, [])

    const firstName = profile?.name?.split(' ')[0] || (lang === 'bm' ? 'Sahabat' : 'Friend')

    return (
        <>
            {showOnboarding && <OnboardingTutorial onComplete={() => setShowOnboarding(false)} />}

            <div style={{ minHeight: '100dvh', background: 'var(--bg)', paddingTop: 52, paddingBottom: 92, maxWidth: 480, margin: '0 auto', animation: 'slideUp 0.3s ease' }}>
                <div style={{ padding: '0 18px' }}>

                    {/* — Greeting — */}
                    <div style={{ marginBottom: 28 }}>
                        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 600, color: 'var(--text)', lineHeight: 1.25, marginBottom: 6 }}>
                            {t(getGreetingKey())}, {firstName}.
                        </h1>
                        <p style={{ color: 'var(--text-sub)', fontSize: 14, lineHeight: 1.5 }}>
                            {stats?.totalEntries > 0 ? t('dashSubtitleEntries')(stats.totalEntries) : t('dashSubtitleStart')}
                        </p>
                    </div>

                    {/* — Stats row — */}
                    {!dashLoading && stats && (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 24 }}>
                            {[
                                { label: t('dashTotalEntries'), value: stats.totalEntries, sub: t('dashEntriesSub') },
                                { label: t('dashStreak'), value: stats.streak, sub: lang === 'bm' ? 'hari berturut' : 'day streak' },
                            ].map(s => (
                                <div key={s.label} style={{ background: 'var(--card)', borderRadius: 14, padding: '16px', boxShadow: 'var(--shadow-card)' }}>
                                    <div style={{ fontSize: 30, fontWeight: 700, color: 'var(--text)', fontFamily: "'Playfair Display', serif", lineHeight: 1, marginBottom: 6 }}>
                                        {s.value}
                                    </div>
                                    <div style={{ fontSize: 13, color: 'var(--text-sub)' }}>{s.label}</div>
                                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{s.sub}</div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* — Prayer Times — */}
                    <Card title={lang === 'bm' ? 'Waktu Solat' : 'Prayer Times'}>
                        {prayerLoading ? (
                            <SkeletonLoader lines={4} height={18} />
                        ) : needsManualSelection || (!prayerLoading && !timings) ? (
                            <div>
                                <p style={{ color: 'var(--text-sub)', fontSize: 14, marginBottom: 12 }}>
                                    {lang === 'bm' ? 'Pilih negeri untuk waktu solat:' : 'Select your state for prayer times:'}
                                </p>
                                <select value={selectedState || ''} onChange={e => setSelectedState(e.target.value)} style={{
                                    width: '100%', padding: '12px 14px', borderRadius: 10,
                                    background: 'var(--surface)', border: '0.5px solid var(--border)',
                                    color: 'var(--text)', fontSize: 15, fontFamily: 'Noto Sans, sans-serif', outline: 'none',
                                }}>
                                    <option value="">{lang === 'bm' ? 'Pilih negeri...' : 'Select state...'}</option>
                                    {(stateList || MALAYSIA_STATE_LIST).map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                                {prayerError && <p style={{ color: 'var(--error)', fontSize: 13, marginTop: 10 }}>{prayerError}</p>}
                            </div>
                        ) : timings ? (
                            <div>
                                {/* Next prayer highlight — full width banner */}
                                {nextPrayer && (
                                    <div style={{ marginBottom: 18, padding: '14px 16px', background: 'var(--surface)', borderRadius: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 3 }}>
                                                {lang === 'bm' ? 'Solat Seterusnya' : 'Next Prayer'}
                                            </div>
                                            <div style={{ fontSize: 17, fontWeight: 600, color: 'var(--text)' }}>
                                                {PRAYERS.find(p => p.key === nextPrayer)?.[lang === 'bm' ? 'labelBM' : 'labelEN'] || nextPrayer}
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 3 }}>
                                                {lang === 'bm' ? 'Masa berbaki' : 'Time left'}
                                            </div>
                                            <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--gold)', fontFamily: "'Playfair Display', serif", lineHeight: 1 }}>
                                                {countdown}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* All prayer times — vertical list */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                                    {PRAYERS.map(({ key, labelBM, labelEN }, idx) => {
                                        const isNext = nextPrayer === key
                                        const isPast = !isNext && PRAYERS.findIndex(p => p.key === nextPrayer) > idx
                                        return (
                                            <div key={key} style={{
                                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                                padding: '12px 0',
                                                borderBottom: idx < PRAYERS.length - 1 ? '0.5px solid var(--border)' : 'none',
                                            }}>
                                                <span style={{
                                                    fontSize: 15, fontFamily: 'Noto Sans, sans-serif',
                                                    color: isNext ? 'var(--text)' : isPast ? 'var(--text-muted)' : 'var(--text-sub)',
                                                    fontWeight: isNext ? 600 : 400,
                                                }}>
                                                    {lang === 'bm' ? labelBM : labelEN}
                                                </span>
                                                <span style={{
                                                    fontSize: 15, fontWeight: isNext ? 700 : 400,
                                                    color: isNext ? 'var(--gold)' : isPast ? 'var(--text-muted)' : 'var(--text)',
                                                    fontFamily: isNext ? "'Playfair Display', serif" : 'Noto Sans, sans-serif',
                                                    letterSpacing: isNext ? 0.5 : 0,
                                                }}>
                                                    {timings[key] || '—'}
                                                </span>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        ) : null}
                    </Card>

                    {/* — Daily Ayah — */}
                    <Card title={lang === 'bm' ? 'Ayat Harian' : 'Daily Verse'}>
                        {contentLoading ? (
                            <SkeletonLoader lines={4} height={16} />
                        ) : ayah ? (
                            <div>
                                {/* Arabic text — large and prominent */}
                                <p style={{
                                    fontFamily: "'Noto Naskh Arabic', serif",
                                    fontSize: 22, lineHeight: 2, color: 'var(--text)',
                                    direction: 'rtl', textAlign: 'right',
                                    marginBottom: 18,
                                }}>
                                    {ayah.arabic}
                                </p>
                                {/* Translation */}
                                <p style={{
                                    color: 'var(--text-sub)', fontSize: 15, lineHeight: 1.75,
                                    marginBottom: 14, fontStyle: 'italic',
                                }}>
                                    &ldquo;{lang === 'bm' ? ayah.malay : (ayah.english || ayah.malay)}&rdquo;
                                </p>
                                {/* Reference */}
                                <p style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                                    {lang === 'bm' ? ayah.referenceBm : ayah.referenceEn}
                                </p>
                            </div>
                        ) : (
                            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>{lang === 'bm' ? 'Gagal memuatkan ayat.' : 'Failed to load verse.'}</p>
                        )}
                    </Card>

                    {/* — Daily Hadith — */}
                    <Card title={lang === 'bm' ? 'Hadith Harian' : 'Daily Hadith'}>
                        {contentLoading ? (
                            <SkeletonLoader lines={5} height={15} />
                        ) : hadith ? (
                            <div>
                                {/* Arabic */}
                                <p style={{
                                    fontFamily: "'Noto Naskh Arabic', serif",
                                    fontSize: 19, lineHeight: 2, color: 'var(--text)',
                                    direction: 'rtl', textAlign: 'right',
                                    marginBottom: 18,
                                }}>
                                    {hadith.arabic}
                                </p>
                                {/* Translation — full, no clip */}
                                <p style={{ color: 'var(--text-sub)', fontSize: 15, lineHeight: 1.75, marginBottom: 18, fontStyle: 'italic' }}>
                                    &ldquo;{lang === 'bm' ? hadith.malay : hadith.english}&rdquo;
                                </p>
                                {/* Source row */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, borderTop: '0.5px solid var(--border)', paddingTop: 14 }}>
                                    <p style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                                        {lang === 'bm' ? hadith.narrator_bm : hadith.narrator_en}
                                    </p>
                                    <p style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                                        {lang === 'bm' ? hadith.source_bm : hadith.source_en}
                                    </p>
                                    {hadith.grade && (
                                        <p style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                                            {lang === 'bm' ? 'Darjah' : 'Grade'}: <span style={{ color: hadith.grade === 'Sahih' ? 'var(--gold)' : 'var(--text-sub)', fontWeight: 500 }}>{hadith.grade}</span>
                                        </p>
                                    )}
                                </div>
                            </div>
                        ) : null}
                    </Card>

                    {/* — Recent Journal — */}
                    <div style={{ marginBottom: 12 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 19, fontWeight: 600, color: 'var(--text)' }}>
                                {t('dashJournalEntries')}
                            </h2>
                            <button onClick={() => navigate('/journal')} style={{
                                background: 'none', border: 'none', color: 'var(--gold)',
                                fontSize: 13, cursor: 'pointer', fontFamily: 'Noto Sans, sans-serif',
                            }}>
                                {lang === 'bm' ? 'Lihat semua' : 'See all'}
                            </button>
                        </div>

                        {dashLoading ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                {[1, 2].map(i => (
                                    <div key={i} style={{
                                        background: 'var(--card)', borderRadius: 14, height: 90,
                                        backgroundImage: 'linear-gradient(90deg, var(--surface) 25%, var(--border) 50%, var(--surface) 75%)',
                                        backgroundSize: '400px 100%', animation: 'shimmer 1.4s infinite'
                                    }} />
                                ))}
                            </div>
                        ) : entriesByDay.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '40px 0' }}>
                                <p style={{ color: 'var(--text-sub)', fontSize: 15, marginBottom: 4 }}>{t('dashNoEntries')}</p>
                                <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 20 }}>{t('dashNoEntriesSub')}</p>
                                <button onClick={() => navigate('/journal')} style={{
                                    background: 'var(--gold)', border: 'none', color: '#1A160B',
                                    padding: '12px 28px', borderRadius: 24,
                                    fontWeight: 600, fontSize: 14, cursor: 'pointer',
                                    fontFamily: 'Noto Sans, sans-serif',
                                }}>
                                    {t('dashWriteFirst')}
                                </button>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                {entriesByDay.slice(0, 2).map(day => (
                                    <div key={day.date}>
                                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6, paddingLeft: 2, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                            {day.label}
                                        </div>
                                        {day.entries.slice(0, 2).map(entry => (
                                            <div key={entry.id} onClick={() => navigate('/journal')}
                                                style={{ background: 'var(--card)', borderRadius: 14, padding: '16px 18px', marginBottom: 8, cursor: 'pointer', boxShadow: 'var(--shadow-card)' }}>
                                                {entry.title && (
                                                    <div style={{ fontWeight: 600, color: 'var(--text)', fontSize: 15, marginBottom: 5 }}>{entry.title}</div>
                                                )}
                                                <div style={{
                                                    color: 'var(--text-sub)', fontSize: 14, lineHeight: 1.6,
                                                    overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical'
                                                }}>
                                                    {entry.content}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                </div>
            </div>
            <BottomNav />
        </>
    )
}
