import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

function getDayLabel(dateStr) {
    const d = new Date(dateStr)
    const today = new Date()
    const yesterday = new Date()
    yesterday.setDate(today.getDate() - 1)

    if (d.toDateString() === today.toDateString()) return 'Today'
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday'
    return d.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })
}

export function useDashboard(userId) {
    const [stats, setStats] = useState(null)
    const [entriesByDay, setEntriesByDay] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const loadDashboard = useCallback(async () => {
        if (!userId) return
        setLoading(true)
        setError(null)

        try {
            const { data: messages, error } = await supabase
                .from('journal_messages')
                .select('id, role, content, created_at')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })

            if (error) throw error

            const allMessages = messages || []
            const userMessages = allMessages.filter((m) => m.role === 'user')
            const totalEntries = userMessages.length

            // Unique days active
            const daySet = new Set(
                userMessages.map((m) => new Date(m.created_at).toDateString())
            )
            const daysActive = daySet.size

            // Streak calculation
            const sortedDays = Array.from(daySet)
                .map((d) => new Date(d))
                .sort((a, b) => b - a)

            let streak = 0
            let today = new Date()
            today.setHours(0, 0, 0, 0)

            for (let i = 0; i < sortedDays.length; i++) {
                const day = sortedDays[i]
                day.setHours(0, 0, 0, 0)
                const diffDays = Math.round((today - day) / (1000 * 60 * 60 * 24))
                if (diffDays === i || (i === 0 && diffDays <= 1)) {
                    streak++
                    if (i === 0 && diffDays === 1) today = day
                    else if (i === 0) today = day
                    else today.setDate(today.getDate() - 1)
                } else break
            }

            const firstEntry = allMessages.length > 0
                ? allMessages[allMessages.length - 1].created_at
                : null

            setStats({
                totalEntries,
                daysActive,
                streak,
                firstEntry,
                totalAiReplies: allMessages.filter((m) => m.role === 'assistant').length,
            })

            // Group user messages by calendar day, newest day first
            const grouped = {}
            for (const msg of userMessages) {
                const dayKey = new Date(msg.created_at).toDateString()
                if (!grouped[dayKey]) grouped[dayKey] = []
                grouped[dayKey].push(msg)
            }

            const byDay = Object.entries(grouped)
                .map(([dayKey, entries]) => ({
                    label: getDayLabel(dayKey),
                    date: dayKey,
                    count: entries.length,
                    entries, // newest first (already ordered by Supabase DESC)
                }))
                .sort((a, b) => new Date(b.date) - new Date(a.date))

            setEntriesByDay(byDay)
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }, [userId])

    useEffect(() => {
        loadDashboard()
    }, [loadDashboard])

    return { stats, entriesByDay, loading, error, reload: loadDashboard }
}
