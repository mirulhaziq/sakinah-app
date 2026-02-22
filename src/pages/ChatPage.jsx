import { useEffect, useRef } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useChat } from '../hooks/useChat'
import Navbar from '../components/Navbar'
import ChatMessage, { DateDivider } from '../components/ChatMessage'
import ChatInput from '../components/ChatInput'
import LoadingSpinner from '../components/LoadingSpinner'
import { BookOpen } from 'lucide-react'
import styles from './ChatPage.module.css'

function groupByDate(messages) {
    const groups = []
    let lastDate = null
    for (const msg of messages) {
        const d = new Date(msg.created_at).toDateString()
        if (d !== lastDate) {
            groups.push({ type: 'divider', date: msg.created_at, key: `div-${msg.id}` })
            lastDate = d
        }
        groups.push({ type: 'message', msg, key: msg.id })
    }
    return groups
}

export default function ChatPage() {
    const { user } = useAuth()
    const { messages, loading, sending, error, sendMessage } = useChat(user?.id)
    const bottomRef = useRef(null)

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages, sending])

    const items = groupByDate(messages)

    return (
        <div className={styles.layout}>
            <Navbar />

            <div className={styles.chatArea}>
                {loading ? (
                    <div className={styles.centered}>
                        <LoadingSpinner size={36} />
                    </div>
                ) : messages.length === 0 ? (
                    <div className={styles.emptyState}>
                        <div className={styles.emptyIcon}>
                            <BookOpen size={32} />
                        </div>
                        <h2 className={styles.emptyTitle}>Begin your Stoic journey</h2>
                        <p className={styles.emptySub}>
                            Share what's on your mind. Marcus remembers everything you write
                            and will guide you with timeless wisdom.
                        </p>
                    </div>
                ) : (
                    <div className={styles.messages}>
                        {items.map((item) =>
                            item.type === 'divider' ? (
                                <DateDivider key={item.key} date={item.date} />
                            ) : (
                                <ChatMessage key={item.key} message={item.msg} />
                            )
                        )}

                        {/* Typing indicator */}
                        {sending && (
                            <div className={styles.typingRow}>
                                <div className={styles.typingAvatar}>✦</div>
                                <div className={styles.typingBubble}>
                                    <span /><span /><span />
                                </div>
                            </div>
                        )}

                        <div ref={bottomRef} />
                    </div>
                )}

                {error && (
                    <div className={styles.errorBanner}>
                        ⚠️ {error}
                    </div>
                )}
            </div>

            <ChatInput onSend={sendMessage} disabled={sending || loading} />
        </div>
    )
}
