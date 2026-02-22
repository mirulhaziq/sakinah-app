import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useDashboard } from '../hooks/useDashboard'
import Navbar from '../components/Navbar'
import StatCard from '../components/StatCard'
import LoadingSpinner from '../components/LoadingSpinner'
import {
    BookOpen, Flame, Calendar, MessageSquare,
    Sparkles, ArrowRight, Star,
} from 'lucide-react'
import styles from './DashboardPage.module.css'

const STOIC_QUOTES = [
    "Begin at once to live, and count each separate day as a separate life. — Seneca",
    "You have power over your mind, not outside events. Realize this. — Marcus Aurelius",
    "The impediment to action advances action. What stands in the way becomes the way. — Marcus Aurelius",
    "Difficulties strengthen the mind, as labor does the body. — Seneca",
    "No man is free who is not master of himself. — Epictetus",
    "The first rule is to keep an untroubled spirit. — Marcus Aurelius",
]

const dailyQuote = STOIC_QUOTES[new Date().getDay() % STOIC_QUOTES.length]

function formatFirstEntry(dateStr) {
    if (!dateStr) return 'No entries yet'
    return new Date(dateStr).toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' })
}

function truncate(text, len = 120) {
    if (text.length <= len) return text
    return text.slice(0, len).trimEnd() + '…'
}

function formatTime(dateStr) {
    return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export default function DashboardPage() {
    const { user, profile } = useAuth()
    const { stats, entriesByDay, loading, error } = useDashboard(user?.id)
    const navigate = useNavigate()

    const displayName = profile?.display_name || user?.email?.split('@')[0] || 'Friend'

    const greeting = () => {
        const h = new Date().getHours()
        if (h < 12) return 'Good morning'
        if (h < 17) return 'Good afternoon'
        return 'Good evening'
    }

    return (
        <div className={styles.layout}>
            <Navbar />
            <main className={styles.main}>
                <div className={styles.container}>

                    {/* Header */}
                    <div className={styles.header}>
                        <div>
                            <p className={styles.greeting}>{greeting()},</p>
                            <h1 className={styles.name}>{displayName} <span className={styles.wave}>👋</span></h1>
                            <p className={styles.subtitle}>
                                {stats?.totalEntries
                                    ? `You've made ${stats.totalEntries} journal ${stats.totalEntries === 1 ? 'entry' : 'entries'}. Keep going.`
                                    : 'Your journey starts with a single entry.'}
                            </p>
                        </div>
                        <button
                            className={`btn-primary ${styles.journalBtn}`}
                            onClick={() => navigate('/chat')}
                        >
                            <BookOpen size={16} />
                            Open Journal
                            <ArrowRight size={14} />
                        </button>
                    </div>

                    {/* Daily quote */}
                    <div className={`glass-card ${styles.quoteCard}`}>
                        <div className={styles.quoteIcon}><Star size={16} /></div>
                        <p className={styles.dailyQuote}>{dailyQuote}</p>
                    </div>

                    {loading ? (
                        <div className={styles.loadingArea}>
                            <LoadingSpinner size={32} />
                        </div>
                    ) : error ? (
                        <div className={styles.errorBox}>⚠️ {error}</div>
                    ) : (
                        <>
                            {/* Stats grid */}
                            <div className={styles.statsGrid}>
                                <StatCard
                                    icon={<BookOpen size={22} />}
                                    label="Total Entries"
                                    value={stats?.totalEntries ?? 0}
                                    sub="journal entries written"
                                    gradient="linear-gradient(135deg, #a855f7, #8b5cf6)"
                                />
                                <StatCard
                                    icon={<Flame size={22} />}
                                    label="Day Streak"
                                    value={stats?.streak ?? 0}
                                    sub={stats?.streak > 0 ? "days in a row 🔥" : "start your streak today"}
                                    gradient="linear-gradient(135deg, #f97316, #ef4444)"
                                />
                                <StatCard
                                    icon={<Calendar size={22} />}
                                    label="Days Active"
                                    value={stats?.daysActive ?? 0}
                                    sub={`since ${formatFirstEntry(stats?.firstEntry)}`}
                                    gradient="linear-gradient(135deg, #6366f1, #4f46e5)"
                                />
                                <StatCard
                                    icon={<MessageSquare size={22} />}
                                    label="AI Reflections"
                                    value={stats?.totalAiReplies ?? 0}
                                    sub="insights from Marcus"
                                    gradient="linear-gradient(135deg, #10b981, #059669)"
                                />
                            </div>

                            {/* Entries by day */}
                            <div className={styles.section}>
                                <div className={styles.sectionHeader}>
                                    <h2 className={styles.sectionTitle}>Journal Entries</h2>
                                    <button className="btn-ghost" onClick={() => navigate('/chat')}>
                                        Open chat
                                    </button>
                                </div>

                                {entriesByDay.length === 0 ? (
                                    <div className={`glass-card ${styles.emptyEntries}`}>
                                        <Sparkles size={28} className={styles.emptyIcon} />
                                        <p className={styles.emptyTitle}>No entries yet</p>
                                        <p className={styles.emptySub}>Start journaling to see your entries here.</p>
                                        <button
                                            className="btn-primary"
                                            onClick={() => navigate('/chat')}
                                            style={{ marginTop: 16 }}
                                        >
                                            Write first entry
                                        </button>
                                    </div>
                                ) : (
                                    <div className={styles.entriesByDay}>
                                        {entriesByDay.map((day) => {
                                            const latest = day.entries[0]
                                            return (
                                                <div
                                                    key={day.date}
                                                    className={`glass-card ${styles.entryRow}`}
                                                    onClick={() => navigate('/chat')}
                                                >
                                                    <span className={styles.dayBadge}>{day.label}</span>
                                                    <p className={styles.entryText}>{truncate(latest.content)}</p>
                                                    <span className={styles.entryTime}>{formatTime(latest.created_at)}</span>
                                                </div>
                                            )
                                        })}
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </main>
        </div>
    )
}
