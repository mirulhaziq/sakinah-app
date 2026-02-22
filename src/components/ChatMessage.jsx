import styles from './ChatMessage.module.css'
import { Sparkles } from 'lucide-react'

function formatTime(dateStr) {
    const d = new Date(dateStr)
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function formatDate(dateStr) {
    const d = new Date(dateStr)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (d.toDateString() === today.toDateString()) return 'Today'
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday'
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' })
}

export function DateDivider({ date }) {
    return (
        <div className={styles.dateDivider}>
            <div className={styles.dateLine} />
            <span className={styles.dateLabel}>{formatDate(date)}</span>
            <div className={styles.dateLine} />
        </div>
    )
}

export default function ChatMessage({ message }) {
    const isUser = message.role === 'user'

    return (
        <div className={`${styles.wrapper} ${isUser ? styles.userWrapper : styles.aiWrapper} fade-in`}>
            {!isUser && (
                <div className={styles.aiAvatar}>
                    <Sparkles size={14} />
                </div>
            )}
            <div className={`${styles.bubble} ${isUser ? styles.userBubble : styles.aiBubble}`}>
                {!isUser && <p className={styles.aiName}>Marcus</p>}
                <p className={styles.content}>{message.content}</p>
                <span className={styles.time}>{formatTime(message.created_at)}</span>
            </div>
            {isUser && <div className={styles.userAvatar}>You</div>}
        </div>
    )
}
