// Sakinah — Dedicated Prayer Times Page
// Typography-first layout. No illustrations. Clean prayer schedule.

import { useState } from 'react'
import { useLanguage } from '../context/LanguageContext'
import { usePrayerTimes } from '../hooks/usePrayerTimes'
import BottomNav from '../components/BottomNav'
import SkeletonLoader from '../components/SkeletonLoader'

const PRAYERS = [
    { key: 'Fajr', labelBM: 'Subuh', labelEN: 'Fajr' },
    { key: 'Sunrise', labelBM: 'Syuruk', labelEN: 'Sunrise' },
    { key: 'Dhuhr', labelBM: 'Zohor', labelEN: 'Dhuhr' },
    { key: 'Asr', labelBM: 'Asar', labelEN: 'Asr' },
    { key: 'Maghrib', labelBM: 'Maghrib', labelEN: 'Maghrib' },
    { key: 'Isha', labelBM: 'Isyak', labelEN: 'Isha' },
]

function formatTime12(time24) {
    if (!time24) return '—'
    const clean = time24.split(' ')[0]
    const [h, m] = clean.split(':').map(Number)
    const period = h >= 12 ? 'pm' : 'am'
    const h12 = h % 12 || 12
    return `${h12}:${String(m).padStart(2, '0')} ${period}`
}

export default function PrayerPage() {
    const { lang } = useLanguage()
    const {
        timings, nextPrayer, countdown, loading, error,
        needsManualSelection, selectedState, setSelectedState,
        stateList, retry
    } = usePrayerTimes()

    const [showStateSelector, setShowStateSelector] = useState(false)

    // Calculate which prayers are past
    function getPrayerStatus(key, idx) {
        if (!nextPrayer) return 'future'
        const nextIdx = PRAYERS.findIndex(p => p.key === nextPrayer)
        if (key === nextPrayer) return 'current'
        if (idx < nextIdx) return 'past'
        return 'future'
    }

    const nextPrayerData = PRAYERS.find(p => p.key === nextPrayer)

    return (
        <>
            <div style={{
                minHeight: '100dvh',
                background: 'var(--bg)',
                paddingTop: 'calc(52px + env(safe-area-inset-top, 0px))',
                paddingBottom: 'calc(92px + env(safe-area-inset-bottom, 0px))',
                maxWidth: 480,
                margin: '0 auto',
                animation: 'slideUp 0.3s ease',
            }}>
                <div style={{ padding: '0 22px' }}>

                    {/* Page header */}
                    <div style={{ marginBottom: 36 }}>
                        <h1 style={{
                            fontFamily: "'Playfair Display', serif",
                            fontSize: 28, fontWeight: 600,
                            color: 'var(--text)', marginBottom: 4,
                        }}>
                            {lang === 'bm' ? 'Waktu Solat' : 'Prayer Times'}
                        </h1>
                        <p style={{ fontSize: 13, color: 'var(--text-muted)', fontFamily: 'Noto Sans, sans-serif' }}>
                            {new Date().toLocaleDateString(lang === 'bm' ? 'ms-MY' : 'en-MY', {
                                weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
                            })}
                        </p>
                    </div>

                    {loading ? (
                        <SkeletonLoader lines={8} height={18} />
                    ) : needsManualSelection || (!loading && !timings) ? (
                        /* State selector */
                        <div style={{
                            background: 'var(--card)', borderRadius: 16,
                            padding: 24, boxShadow: 'var(--shadow-card)',
                        }}>
                            <p style={{ color: 'var(--text)', fontSize: 16, fontWeight: 600, marginBottom: 8 }}>
                                {lang === 'bm' ? 'Pilih Negeri' : 'Select Your State'}
                            </p>
                            <p style={{ color: 'var(--text-sub)', fontSize: 14, marginBottom: 20, lineHeight: 1.6 }}>
                                {lang === 'bm'
                                    ? 'Benarkan lokasi atau pilih negeri secara manual untuk mendapatkan waktu solat yang tepat.'
                                    : 'Allow location access or manually select your state for accurate prayer times.'}
                            </p>
                            <select
                                value={selectedState || ''}
                                onChange={e => setSelectedState(e.target.value)}
                                style={{
                                    width: '100%', padding: '14px 16px', borderRadius: 12,
                                    background: 'var(--surface)', border: '0.5px solid var(--border)',
                                    color: 'var(--text)', fontSize: 15,
                                    fontFamily: 'Noto Sans, sans-serif', outline: 'none',
                                    appearance: 'none', cursor: 'pointer',
                                }}
                            >
                                <option value="">
                                    {lang === 'bm' ? 'Pilih negeri...' : 'Select state...'}
                                </option>
                                {stateList.map(s => (
                                    <option key={s} value={s}>{s}</option>
                                ))}
                            </select>
                            {error && (
                                <p style={{ color: 'var(--error)', fontSize: 13, marginTop: 12 }}>{error}</p>
                            )}
                            <button onClick={retry} style={{
                                width: '100%', marginTop: 12, padding: '13px 0', borderRadius: 12,
                                border: '0.5px solid var(--border)', background: 'transparent',
                                color: 'var(--text-sub)', fontSize: 14, cursor: 'pointer',
                                fontFamily: 'Noto Sans, sans-serif',
                            }}>
                                {lang === 'bm' ? 'Cuba gunakan GPS' : 'Try GPS location'}
                            </button>
                        </div>
                    ) : timings ? (
                        <>
                            {/* Featured next prayer — hero block */}
                            {nextPrayerData && (
                                <div style={{
                                    textAlign: 'center', marginBottom: 40,
                                    padding: '32px 24px',
                                    background: 'var(--card)', borderRadius: 20,
                                    boxShadow: 'var(--shadow-card)',
                                }}>
                                    <p style={{
                                        fontSize: 11, color: 'var(--text-muted)',
                                        letterSpacing: '1.5px', fontFamily: 'Noto Sans, sans-serif',
                                        textTransform: 'uppercase', marginBottom: 12,
                                    }}>
                                        {lang === 'bm' ? 'Solat Seterusnya' : 'Next Prayer'}
                                    </p>
                                    <p style={{
                                        fontFamily: "'Playfair Display', serif",
                                        fontSize: 32, fontStyle: 'italic',
                                        fontWeight: 600, color: 'var(--text)',
                                        marginBottom: 8, lineHeight: 1.2,
                                    }}>
                                        {lang === 'bm' ? nextPrayerData.labelBM : nextPrayerData.labelEN}
                                    </p>
                                    <p style={{
                                        fontFamily: "'Playfair Display', serif",
                                        fontSize: 56, fontWeight: 700,
                                        color: 'var(--text)', lineHeight: 1, marginBottom: 16,
                                        letterSpacing: -1,
                                    }}>
                                        {formatTime12(timings[nextPrayer])}
                                    </p>
                                    <p style={{
                                        fontSize: 14, color: 'var(--text-sub)',
                                        fontFamily: 'Noto Sans, sans-serif',
                                    }}>
                                        {lang === 'bm' ? 'dalam ' : 'in '}{countdown}
                                    </p>
                                </div>
                            )}

                            {/* Full prayer schedule */}
                            <div style={{
                                background: 'var(--card)', borderRadius: 16,
                                boxShadow: 'var(--shadow-card)', overflow: 'hidden',
                            }}>
                                {PRAYERS.map(({ key, labelBM, labelEN }, idx) => {
                                    const status = getPrayerStatus(key, idx)
                                    const isCurrent = status === 'current'
                                    const isPast = status === 'past'

                                    return (
                                        <div key={key} style={{
                                            display: 'flex', justifyContent: 'space-between',
                                            alignItems: 'center',
                                            padding: '18px 20px',
                                            borderBottom: idx < PRAYERS.length - 1 ? '0.5px solid var(--border)' : 'none',
                                            borderLeft: isCurrent ? '3px solid var(--gold)' : '3px solid transparent',
                                            background: isCurrent ? 'var(--surface)' : 'transparent',
                                            transition: 'background 0.2s',
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                <span style={{
                                                    fontSize: 16,
                                                    fontFamily: 'Noto Sans, sans-serif',
                                                    color: isCurrent ? 'var(--text)'
                                                        : isPast ? 'var(--text-muted)'
                                                            : 'var(--text-sub)',
                                                    fontWeight: isCurrent ? 600 : 400,
                                                }}>
                                                    {lang === 'bm' ? labelBM : labelEN}
                                                </span>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                                                <span style={{
                                                    fontSize: 16,
                                                    fontFamily: isCurrent ? "'Playfair Display', serif" : 'Noto Sans, sans-serif',
                                                    fontWeight: isCurrent ? 700 : 400,
                                                    color: isCurrent ? 'var(--gold)'
                                                        : isPast ? 'var(--text-muted)'
                                                            : 'var(--text)',
                                                    letterSpacing: isCurrent ? 0.5 : 0,
                                                }}>
                                                    {formatTime12(timings[key])}
                                                </span>
                                                {isPast && (
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                                                        stroke="var(--text-muted)" strokeWidth="2"
                                                        strokeLinecap="round" strokeLinejoin="round">
                                                        <polyline points="20 6 9 17 4 12" />
                                                    </svg>
                                                )}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>

                            {/* Location + change */}
                            <div style={{
                                display: 'flex', alignItems: 'center',
                                justifyContent: 'space-between',
                                marginTop: 20, padding: '14px 16px',
                                background: 'var(--card)', borderRadius: 12,
                                boxShadow: 'var(--shadow-card)',
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                                        stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round">
                                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                        <circle cx="12" cy="10" r="3" />
                                    </svg>
                                    <span style={{ fontSize: 13, color: 'var(--text-sub)', fontFamily: 'Noto Sans, sans-serif' }}>
                                        {selectedState || (lang === 'bm' ? 'GPS Lokasi Kini' : 'Current GPS Location')}
                                    </span>
                                </div>
                                <button onClick={() => setSelectedState(null)} style={{
                                    background: 'none', border: 'none',
                                    color: 'var(--gold)', fontSize: 13, cursor: 'pointer',
                                    fontFamily: 'Noto Sans, sans-serif',
                                }}>
                                    {lang === 'bm' ? 'Tukar' : 'Change'}
                                </button>
                            </div>

                            {/* Method note */}
                            <p style={{
                                textAlign: 'center', fontSize: 12,
                                color: 'var(--text-muted)', marginTop: 16,
                                fontFamily: 'Noto Sans, sans-serif',
                            }}>
                                {lang === 'bm'
                                    ? 'Kiraan menggunakan Kaedah JAKIM (Jabatan Kemajuan Islam Malaysia)'
                                    : 'Calculation uses JAKIM method (Jabatan Kemajuan Islam Malaysia)'}
                            </p>
                        </>
                    ) : null}
                </div>
            </div>
            <BottomNav />
        </>
    )
}
