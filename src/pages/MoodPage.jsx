// Sakinah — Mood Page (Stoic style)
// Clean bar chart, gold bar section headers, no emoji chrome

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import { supabase } from '../lib/supabase'
import { getMoodVerse } from '../data/moodVerses'
import BottomNav from '../components/BottomNav'

const MOODS = [
    { value: 1, emoji: '😞', labelBM: 'Sangat Buruk', labelEN: 'Very Bad' },
    { value: 2, emoji: '😟', labelBM: 'Buruk', labelEN: 'Bad' },
    { value: 3, emoji: '😐', labelBM: 'Sederhana', labelEN: 'Neutral' },
    { value: 4, emoji: '🙂', labelBM: 'Baik', labelEN: 'Good' },
    { value: 5, emoji: '😊', labelBM: 'Sangat Baik', labelEN: 'Very Good' },
]

function todayKey() {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function getLast7Days() {
    return Array.from({ length: 7 }, (_, i) => {
        const d = new Date(); d.setDate(d.getDate() - (6 - i))
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
        return { key, day: d.getDay() }
    })
}

export default function MoodPage() {
    const { user } = useAuth()
    const { t, lang } = useLanguage()
    const [selectedMood, setSelectedMood] = useState(0)
    const [todayMood, setTodayMood] = useState(null)
    const [weekData, setWeekData] = useState({})
    const [saving, setSaving] = useState(false)
    const [saved, setSaved] = useState(false)
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(true)

    const days7 = getLast7Days()

    const load = useCallback(async () => {
        if (!user?.id) return
        setLoading(true)
        const since = days7[0].key
        const { data } = await supabase.from('mood_logs').select('*')
            .eq('user_id', user.id).gte('logged_at', since).order('logged_at', { ascending: true })
        const map = {}
        for (const row of data || []) map[row.logged_at] = row.mood
        setWeekData(map)
        const today = map[todayKey()]
        if (today) { setTodayMood(today); setSelectedMood(today) }
        setLoading(false)
    }, [user?.id])

    useEffect(() => { load() }, [load])

    async function handleSave() {
        if (!selectedMood) return
        setSaving(true); setError(null)
        const { error: err } = await supabase.from('mood_logs')
            .upsert({ user_id: user.id, mood: selectedMood, logged_at: todayKey() }, { onConflict: 'user_id,logged_at' })
        if (err) { setError(t('moodError')); setSaving(false); return }
        setTodayMood(selectedMood)
        setWeekData(prev => ({ ...prev, [todayKey()]: selectedMood }))
        setSaved(true); setSaving(false)
        setTimeout(() => setSaved(false), 2000)
    }

    // Average mood for reframe
    const moodValues = Object.values(weekData)
    const avgMood = moodValues.length ? moodValues.reduce((a, b) => a + b, 0) / moodValues.length : 3
    const verse = getMoodVerse(avgMood)

    const DAY_LABELS_BM = ['Ahd', 'Isn', 'Sel', 'Rab', 'Kha', 'Jum', 'Sab']
    const DAY_LABELS_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

    return (
        <>
            <div style={{ minHeight: '100dvh', background: 'var(--bg)', paddingTop: 48, paddingBottom: 96, maxWidth: 480, margin: '0 auto', animation: 'slideUp 0.3s ease' }}>
                <div style={{ padding: '0 20px' }}>

                    {/* Header */}
                    <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 600, color: 'var(--text)', marginBottom: 6 }}>
                        {t('moodTitle')}
                    </h1>
                    <p style={{ color: 'var(--text-sub)', fontSize: 14, marginBottom: 32 }}>{t('moodSubtitle')}</p>

                    {/* Today's Mood Logger */}
                    <div style={{ background: 'var(--card)', borderRadius: 16, padding: 24, marginBottom: 32, boxShadow: 'var(--shadow-card)' }}>
                        <div style={{ display: 'flex', gap: 6, marginBottom: 4 }}>
                            <div style={{ width: 3, height: 20, background: 'var(--gold)', borderRadius: 2 }} />
                            <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)' }}>{lang === 'bm' ? 'Mood Hari Ini' : "Today's Mood"}</span>
                        </div>

                        {/* Emoji selector */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '20px 4px 16px' }}>
                            {MOODS.map(m => (
                                <button key={m.value} onClick={() => setSelectedMood(m.value)} style={{
                                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                                    background: 'none', border: 'none', cursor: 'pointer', padding: '8px 6px',
                                    borderRadius: 12,
                                    opacity: selectedMood === 0 || selectedMood === m.value ? 1 : 0.3,
                                    transform: selectedMood === m.value ? 'scale(1.2)' : 'scale(1)',
                                    transition: 'all 0.2s ease',
                                }}>
                                    <span style={{ fontSize: 30 }}>{m.emoji}</span>
                                    <span style={{ fontSize: 11, color: selectedMood === m.value ? 'var(--gold)' : 'var(--text-muted)', fontWeight: selectedMood === m.value ? 600 : 400 }}>
                                        {lang === 'bm' ? m.labelBM : m.labelEN}
                                    </span>
                                </button>
                            ))}
                        </div>

                        {error && <p style={{ color: 'var(--error)', fontSize: 13, marginBottom: 12 }}>{error}</p>}
                        {saved && <p style={{ color: 'var(--success)', fontSize: 13, marginBottom: 12, textAlign: 'center' }}>{t('moodSaved')}</p>}

                        <button onClick={handleSave} disabled={!selectedMood || saving} style={{
                            width: '100%', padding: '14px 0', borderRadius: 12, border: 'none',
                            background: 'var(--gold)', color: '#1A160B',
                            fontWeight: 600, fontSize: 15, cursor: 'pointer',
                            fontFamily: 'Noto Sans, sans-serif',
                            opacity: (!selectedMood || saving) ? 0.4 : 1,
                        }}>
                            {saving ? '...' : todayMood ? t('moodUpdateBtn') : t('moodSaveBtn')}
                        </button>
                    </div>

                    {/* Weekly chart */}
                    <div style={{ background: 'var(--card)', borderRadius: 16, padding: 24, marginBottom: 32, boxShadow: 'var(--shadow-card)' }}>
                        <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
                            <div style={{ width: 3, height: 20, background: 'var(--gold)', borderRadius: 2 }} />
                            <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)' }}>{t('moodWeeklyTitle')}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 6, height: 100 }}>
                            {days7.map(({ key, day }) => {
                                const val = weekData[key]
                                const pct = val ? (val / 5) * 100 : 0
                                const isToday = key === todayKey()
                                const dayLabel = lang === 'bm' ? DAY_LABELS_BM[day] : DAY_LABELS_EN[day]
                                return (
                                    <div key={key} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, height: '100%', justifyContent: 'flex-end' }}>
                                        <div style={{ fontSize: 14 }}>{val ? MOODS[val - 1].emoji : ''}</div>
                                        <div style={{
                                            width: '100%', borderRadius: '4px 4px 0 0',
                                            background: val ? (isToday ? 'var(--gold)' : 'var(--surface)') : 'var(--border)',
                                            height: val ? `${pct}%` : 4,
                                            minHeight: 4, transition: 'height 0.4s ease',
                                        }} />
                                        <span style={{ fontSize: 10, color: isToday ? 'var(--gold)' : 'var(--text-muted)', fontWeight: isToday ? 600 : 400 }}>
                                            {dayLabel}
                                        </span>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {/* Islamic reframe */}
                    {verse && (
                        <div style={{ background: 'var(--card)', borderRadius: 16, padding: 24, boxShadow: 'var(--shadow-card)' }}>
                            <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
                                <div style={{ width: 3, height: 20, background: 'var(--gold)', borderRadius: 2 }} />
                                <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)' }}>{t('moodIslamicTitle')}</span>
                            </div>
                            <p style={{ fontFamily: "'Noto Naskh Arabic', serif", fontSize: 20, color: 'var(--text)', direction: 'rtl', lineHeight: 1.9, marginBottom: 14 }}>
                                {verse.arabic}
                            </p>
                            <p style={{ color: 'var(--text-sub)', fontSize: 14, lineHeight: 1.7, marginBottom: 8 }}>
                                {lang === 'bm' ? verse.bm : verse.en}
                            </p>
                            <p style={{ color: 'var(--text-muted)', fontSize: 12 }}>{verse.reference}</p>
                        </div>
                    )}

                </div>
            </div>
            <BottomNav />
        </>
    )
}
