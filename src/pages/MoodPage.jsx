// Sakinah سكينة — Mood Tracker Page (full inline styles)
// Daily mood logging, weekly bar chart (CSS only), Islamic reframe based on average

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import { supabase } from '../lib/supabase'
import { getMoodVerse } from '../data/moodVerses'
import Navbar from '../components/Navbar'
import { SkeletonCard } from '../components/SkeletonLoader'

const MOOD_EMOJIS = ['', '😞', '😟', '😐', '🙂', '😊']
const MOOD_COLORS = ['', '#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e']

function getTodayStr() {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function getLast7Days() {
    const days = []
    for (let i = 6; i >= 0; i--) {
        const d = new Date()
        d.setDate(d.getDate() - i)
        days.push({
            date: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`,
            dayIndex: d.getDay(),
        })
    }
    return days
}

export default function MoodPage() {
    const { user } = useAuth()
    const { lang, t } = useLanguage()
    const [selectedMood, setSelectedMood] = useState(0)
    const [todayLog, setTodayLog] = useState(null)
    const [weekLogs, setWeekLogs] = useState([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [saveMsg, setSaveMsg] = useState(null)
    const [error, setError] = useState(null)
    const [chartVisible, setChartVisible] = useState(false)

    const loadData = useCallback(async () => {
        if (!user) return
        setLoading(true)
        setError(null)
        try {
            const today = getTodayStr()
            const last7 = getLast7Days().map(d => d.date)

            const { data, error } = await supabase
                .from('mood_logs')
                .select('*')
                .eq('user_id', user.id)
                .in('logged_at', last7)
                .order('logged_at', { ascending: true })

            if (error) throw error
            const logs = data || []
            const todayEntry = logs.find(l => l.logged_at === today)
            setTodayLog(todayEntry || null)
            if (todayEntry) setSelectedMood(todayEntry.mood)
            setWeekLogs(logs)
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
            setTimeout(() => setChartVisible(true), 100)
        }
    }, [user])

    useEffect(() => { loadData() }, [loadData])

    async function handleSaveMood() {
        if (!selectedMood) return
        setSaving(true)
        setSaveMsg(null)
        try {
            const today = getTodayStr()
            const { data, error } = await supabase
                .from('mood_logs')
                .upsert({ user_id: user.id, mood: selectedMood, logged_at: today }, { onConflict: 'user_id,logged_at' })
                .select().single()
            if (error) throw error
            setTodayLog(data)
            setWeekLogs(prev => {
                const filtered = prev.filter(l => l.logged_at !== today)
                return [...filtered, data].sort((a, b) => a.logged_at.localeCompare(b.logged_at))
            })
            setSaveMsg(todayLog ? t('moodUpdated') : t('moodSaved'))
            setTimeout(() => setSaveMsg(null), 3000)
        } catch (err) {
            setError(err.message || t('moodError'))
        } finally {
            setSaving(false)
        }
    }

    const days7 = getLast7Days()
    const logMap = {}
    weekLogs.forEach(l => { logMap[l.logged_at] = l.mood })
    const weekMoods = days7.map(d => ({ ...d, mood: logMap[d.date] || 0 }))
    const moodsWithData = weekMoods.filter(d => d.mood > 0)
    const avgMood = moodsWithData.length > 0
        ? moodsWithData.reduce((sum, d) => sum + d.mood, 0) / moodsWithData.length
        : 0

    const moodVerse = avgMood > 0 ? getMoodVerse(avgMood) : null
    const dayLabels = t('moodDays')  // Array of 7 day names

    const cardStyle = {
        background: 'var(--bg-card)',
        backdropFilter: 'blur(20px)',
        border: '1px solid var(--glass-border)',
        borderRadius: 18, padding: '20px 18px',
        marginBottom: 16, boxShadow: 'var(--shadow)',
    }

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', flexDirection: 'column' }}>
            <Navbar />
            <main style={{ flex: 1, maxWidth: 480, margin: '0 auto', padding: '20px 16px 40px', width: '100%' }}>
                <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4, animation: 'sakinahSlideUp 0.4s ease' }}>
                    {t('moodTitle')}
                </h1>
                <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 20 }}>{t('moodSubtitle')}</p>

                {loading ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        <SkeletonCard height={140} />
                        <SkeletonCard height={180} />
                        <SkeletonCard height={120} />
                    </div>
                ) : (
                    <>
                        {/* Mood Selector */}
                        <div style={{ ...cardStyle, animation: 'sakinahSlideUp 0.45s ease' }}>
                            {todayLog && (
                                <p style={{ color: 'var(--accent)', fontSize: 12, fontWeight: 600, marginBottom: 12, background: 'rgba(201,169,110,0.1)', padding: '6px 12px', borderRadius: 20, display: 'inline-block' }}>
                                    ✓ {t('moodAlreadyLogged')}
                                </p>
                            )}
                            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 16 }}>
                                {[1, 2, 3, 4, 5].map(n => (
                                    <button
                                        key={n}
                                        onClick={() => setSelectedMood(selectedMood === n ? 0 : n)}
                                        style={{
                                            flex: 1, aspectRatio: '1/1',
                                            borderRadius: 14, border: `2px solid ${selectedMood === n ? MOOD_COLORS[n] : 'var(--glass-border)'}`,
                                            background: selectedMood === n ? `${MOOD_COLORS[n]}22` : 'transparent',
                                            fontSize: 28, cursor: 'pointer',
                                            transition: 'all 0.2s ease',
                                            transform: selectedMood === n ? 'scale(1.15)' : 'scale(1)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        }}
                                    >
                                        {MOOD_EMOJIS[n]}
                                    </button>
                                ))}
                            </div>
                            {selectedMood > 0 && (
                                <p style={{ textAlign: 'center', color: MOOD_COLORS[selectedMood], fontWeight: 700, fontSize: 14, marginBottom: 14 }}>
                                    {t('moodLabels')[selectedMood]}
                                </p>
                            )}

                            {saveMsg && (
                                <p style={{ color: '#4ade80', fontSize: 13, textAlign: 'center', marginBottom: 10 }}>✓ {saveMsg}</p>
                            )}
                            {error && (
                                <p style={{ color: 'var(--error)', fontSize: 13, textAlign: 'center', marginBottom: 10 }}>⚠️ {error}</p>
                            )}

                            <button
                                onClick={handleSaveMood}
                                disabled={!selectedMood || saving}
                                style={{
                                    width: '100%', padding: '13px 0',
                                    background: !selectedMood || saving ? 'var(--bg-card)' : 'var(--accent-gradient)',
                                    border: '1px solid var(--glass-border)',
                                    color: !selectedMood || saving ? 'var(--text-muted)' : 'white',
                                    fontWeight: 700, fontSize: 15, borderRadius: 12,
                                    cursor: !selectedMood || saving ? 'not-allowed' : 'pointer',
                                    transition: 'all 0.2s ease',
                                }}
                            >
                                {saving ? '...' : (todayLog ? t('moodUpdateBtn') : t('moodSaveBtn'))}
                            </button>
                        </div>

                        {/* Weekly Bar Chart */}
                        <div style={{ ...cardStyle, animation: 'sakinahSlideUp 0.55s ease' }}>
                            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>
                                📊 {t('moodWeeklyTitle')}
                            </h2>
                            {weekLogs.length === 0 ? (
                                <p style={{ color: 'var(--text-muted)', fontSize: 13, textAlign: 'center', padding: '20px 0' }}>{t('moodNoData')}</p>
                            ) : (
                                <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end', height: 100 }}>
                                    {weekMoods.map((day, i) => {
                                        const pct = day.mood > 0 ? (day.mood / 5) * 100 : 8
                                        const isMood = day.mood > 0
                                        return (
                                            <div key={day.date} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                                                <div style={{ width: '100%', height: 80, display: 'flex', alignItems: 'flex-end' }}>
                                                    <div style={{
                                                        width: '100%',
                                                        height: chartVisible ? `${pct}%` : '0%',
                                                        background: isMood ? MOOD_COLORS[day.mood] : 'var(--glass-border)',
                                                        borderRadius: '4px 4px 0 0',
                                                        transition: `height 0.6s cubic-bezier(0.34,1.56,0.64,1) ${i * 60}ms`,
                                                        position: 'relative',
                                                    }}>
                                                        {isMood && (
                                                            <div style={{ position: 'absolute', top: -20, left: '50%', transform: 'translateX(-50%)', fontSize: 12 }}>
                                                                {MOOD_EMOJIS[day.mood]}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600 }}>
                                                    {dayLabels[day.dayIndex]?.slice(0, 3)}
                                                </span>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Islamic Reframe */}
                        {moodVerse && (
                            <div style={{ ...cardStyle, animation: 'sakinahSlideUp 0.65s ease' }}>
                                <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>
                                    🌙 {t('moodIslamicTitle')}
                                </h2>
                                <p style={{
                                    fontFamily: "'Noto Naskh Arabic', serif",
                                    fontSize: 18, direction: 'rtl', textAlign: 'right',
                                    color: 'var(--accent)', lineHeight: 2, marginBottom: 12,
                                }}>
                                    {moodVerse.arabic}
                                </p>
                                <p style={{ color: 'var(--text-secondary)', fontSize: 13, lineHeight: 1.7, marginBottom: 8 }}>
                                    {lang === 'bm' ? moodVerse.malay : moodVerse.english}
                                </p>
                                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 4 }}>
                                    <p style={{ color: 'var(--text-muted)', fontSize: 11, fontStyle: 'italic' }}>
                                        {lang === 'bm' ? moodVerse.theme_bm : moodVerse.theme_en}
                                    </p>
                                    <p style={{ color: 'var(--accent)', fontSize: 11, fontWeight: 600 }}>
                                        {lang === 'bm' ? moodVerse.reference_bm : moodVerse.reference_en}
                                    </p>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </main>
        </div>
    )
}
