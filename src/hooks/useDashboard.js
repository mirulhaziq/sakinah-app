// Sakinah سكينة — Updated Dashboard Hook
// Queries journal_entries (new table) and mood_logs

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

const BM_MONTHS = ['Januari', 'Februari', 'Mac', 'April', 'Mei', 'Jun', 'Julai', 'Ogos', 'September', 'Oktober', 'November', 'Disember']

function getDayLabel(dateStr) {
    const d = new Date(dateStr)
    const today = new Date()
    const yesterday = new Date(); yesterday.setDate(today.getDate() - 1)
    const tomorrow = new Date(); tomorrow.setDate(today.getDate() + 1)
    if (d.toDateString() === today.toDateString()) return 'Hari Ini'
    if (d.toDateString() === yesterday.toDateString()) return 'Semalam'
    if (d.toDateString() === tomorrow.toDateString()) return 'Esok'
    return `${d.getDate()} ${BM_MONTHS[d.getMonth()]}`
}

function calculateStreak(entriesByDay) {
    if (!entriesByDay || entriesByDay.length === 0) return 0
    let streak = 0
    const today = new Date()
    let checkDate = new Date(today)
    const dateSet = new Set(entriesByDay.map(g => g.date))

    while (true) {
        const key = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, '0')}-${String(checkDate.getDate()).padStart(2, '0')}`
        if (dateSet.has(key)) {
            streak++
            checkDate.setDate(checkDate.getDate() - 1)
        } else {
            break
        }
    }
    return streak
}

export function useDashboard(userId) {
    const [stats, setStats] = useState(null)
    const [entriesByDay, setEntriesByDay] = useState([])
    const [loading, setLoading] = useState(true)

    const load = useCallback(async () => {
        if (!userId) { setLoading(false); return }
        setLoading(true)
        try {
            const { data: entries, error } = await supabase
                .from('journal_entries')
                .select('id, title, content, mood, tags, created_at')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })

            if (error) throw error

            // Group by day
            const grouped = {}
            for (const entry of entries || []) {
                const dateKey = entry.created_at.slice(0, 10)
                if (!grouped[dateKey]) grouped[dateKey] = []
                grouped[dateKey].push(entry)
            }

            const byDay = Object.entries(grouped)
                .sort(([a], [b]) => b.localeCompare(a))
                .map(([date, es]) => ({ date, label: getDayLabel(date), entries: es }))

            setEntriesByDay(byDay)

            // Stats
            const totalEntries = entries?.length ?? 0
            const streak = calculateStreak(byDay)
            const daysActive = byDay.length
            const firstEntry = entries?.length > 0 ? entries[entries.length - 1].created_at : null

            // Count AI replies (from chat_messages)
            const { count: aiCount } = await supabase
                .from('chat_messages')
                .select('id', { count: 'exact', head: true })
                .eq('user_id', userId)
                .eq('role', 'assistant')

            setStats({
                totalEntries, streak, daysActive, firstEntry,
                totalAiReplies: aiCount ?? 0,
            })
        } catch (err) {
            console.error('useDashboard error:', err)
        } finally {
            setLoading(false)
        }
    }, [userId])

    useEffect(() => { load() }, [load])

    return { stats, entriesByDay, loading, reload: load }
}
