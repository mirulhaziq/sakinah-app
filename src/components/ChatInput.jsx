import { useState, useRef } from 'react'
import { Send } from 'lucide-react'
import styles from './ChatInput.module.css'

const PROMPTS = [
    "Today I felt...",
    "Something I'm grateful for...",
    "I'm struggling with...",
    "A thought I keep having...",
    "I achieved something today...",
]

export default function ChatInput({ onSend, disabled }) {
    const [value, setValue] = useState('')
    const textareaRef = useRef(null)

    function handleKeyDown(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    function handleSend() {
        const trimmed = value.trim()
        if (!trimmed || disabled) return
        onSend(trimmed)
        setValue('')
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto'
        }
    }

    function handleInput(e) {
        setValue(e.target.value)
        // Auto-resize
        e.target.style.height = 'auto'
        e.target.style.height = Math.min(e.target.scrollHeight, 160) + 'px'
    }

    function usePrompt(p) {
        setValue(p)
        textareaRef.current?.focus()
    }

    return (
        <div className={styles.container}>
            {/* Quick prompts */}
            {!value && (
                <div className={styles.prompts}>
                    {PROMPTS.map((p) => (
                        <button key={p} className={styles.prompt} onClick={() => usePrompt(p)}>
                            {p}
                        </button>
                    ))}
                </div>
            )}

            <div className={styles.inputRow}>
                <textarea
                    ref={textareaRef}
                    value={value}
                    onChange={handleInput}
                    onKeyDown={handleKeyDown}
                    placeholder="Share what's on your mind… (Enter to send)"
                    rows={1}
                    className={styles.textarea}
                    disabled={disabled}
                />
                <button
                    className={`${styles.sendBtn} ${value.trim() ? styles.active : ''}`}
                    onClick={handleSend}
                    disabled={!value.trim() || disabled}
                    aria-label="Send message"
                >
                    {disabled ? (
                        <div className={styles.thinkingDots}>
                            <span /><span /><span />
                        </div>
                    ) : (
                        <Send size={18} />
                    )}
                </button>
            </div>
            <p className={styles.hint}>Enter to send · Shift+Enter for new line</p>
        </div>
    )
}
