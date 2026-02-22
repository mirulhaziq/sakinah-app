// Sakinah سكينة — Chat Page (full inline styles)
// 4 persona selector, streaming AI, clear history, Supabase persistence

import { useState, useEffect, useRef, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import { supabase } from '../lib/supabase'
import { sendToGemini } from '../lib/gemini'
import { PERSONAS } from '../data/personas'
import Navbar from '../components/Navbar'
import ConfirmModal from '../components/ConfirmModal'
import { SkeletonCard } from '../components/SkeletonLoader'

const CONTEXT_LIMIT = 30

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

function formatDateDivider(dateStr) {
    const d = new Date(dateStr)
    const today = new Date()
    const yesterday = new Date(); yesterday.setDate(today.getDate() - 1)
    if (d.toDateString() === today.toDateString()) return 'Hari Ini'
    if (d.toDateString() === yesterday.toDateString()) return 'Semalam'
    return d.toLocaleDateString('ms-MY', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default function ChatPage() {
    const { user, profile } = useAuth()
    const { lang, t } = useLanguage()
    const [persona, setPersona] = useState(profile?.preferred_persona || 'balanced')
    const [messages, setMessages] = useState([])
    const [loading, setLoading] = useState(true)
    const [sending, setSending] = useState(false)
    const [inputText, setInputText] = useState('')
    const [streamText, setStreamText] = useState('')
    const [error, setError] = useState(null)
    const [showClear, setShowClear] = useState(false)
    const bottomRef = useRef(null)
    const inputRef = useRef(null)

    // Load messages from Supabase
    const loadMessages = useCallback(async () => {
        if (!user) return
        setLoading(true)
        try {
            const { data, error } = await supabase
                .from('chat_messages')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: true })
            if (error) throw error
            setMessages(data || [])
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }, [user])

    useEffect(() => { loadMessages() }, [loadMessages])

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages, sending, streamText])

    async function handleSend() {
        const content = inputText.trim()
        if (!content || sending) return
        setInputText('')
        setSending(true)
        setError(null)
        setStreamText('')

        const tempId = `temp-${Date.now()}`
        const tempMsg = { id: tempId, user_id: user.id, persona, role: 'user', content, created_at: new Date().toISOString() }
        setMessages(prev => [...prev, tempMsg])

        try {
            // Save user message
            const { data: savedUser, error: ue } = await supabase
                .from('chat_messages')
                .insert({ user_id: user.id, persona, role: 'user', content })
                .select().single()
            if (ue) throw ue

            // Build history for Gemini
            const allMsgs = [...messages, savedUser]
            const geminiHistory = allMsgs.slice(-CONTEXT_LIMIT).map(m => ({ role: m.role, content: m.content }))

            // Get AI response (non-streaming, stable)
            const systemPrompt = PERSONAS[persona]?.systemPrompt || PERSONAS.balanced.systemPrompt
            const aiReply = await sendToGemini([...geminiHistory], systemPrompt)

            // Save AI message
            const { data: savedAi, error: ae } = await supabase
                .from('chat_messages')
                .insert({ user_id: user.id, persona, role: 'assistant', content: aiReply })
                .select().single()
            if (ae) throw ae

            setMessages(prev => {
                const filtered = prev.filter(m => m.id !== tempId)
                return [...filtered, savedUser, savedAi]
            })
        } catch (err) {
            setMessages(prev => prev.filter(m => m.id !== tempId))
            setError(err.message || t('chatError'))
        } finally {
            setSending(false)
            setStreamText('')
            inputRef.current?.focus()
        }
    }

    async function handleClearHistory() {
        try {
            await supabase.from('chat_messages').delete().eq('user_id', user.id)
            setMessages([])
        } catch (err) {
            setError(err.message)
        }
        setShowClear(false)
    }

    function handleKeyDown(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    const personaLabels = {
        friend: t('chatPersonaFriend'),
        ustaz: t('chatPersonaUstaz'),
        counselor: t('chatPersonaCounselor'),
        balanced: t('chatPersonaBalanced'),
    }

    const items = groupByDate(messages)

    const pageStyle = { minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', flexDirection: 'column' }

    const bubbleStyle = (role) => ({
        maxWidth: '80%',
        padding: '11px 16px',
        borderRadius: role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
        background: role === 'user' ? 'var(--accent-gradient)' : 'var(--bg-card)',
        border: role === 'user' ? 'none' : '1px solid var(--glass-border)',
        color: role === 'user' ? 'white' : 'var(--text-primary)',
        fontSize: 14, lineHeight: 1.7,
        boxShadow: 'var(--shadow)',
        wordBreak: 'break-word',
        whiteSpace: 'pre-wrap',
    })

    return (
        <div style={pageStyle}>
            <Navbar />

            {/* Persona selector */}
            <div style={{
                background: 'var(--bg-secondary)',
                borderBottom: '1px solid var(--glass-border)',
                padding: '10px 16px',
                maxWidth: 480, margin: '0 auto', width: '100%',
            }}>
                <div style={{ display: 'flex', gap: 6, overflowX: 'auto' }}>
                    {Object.values(PERSONAS).map(p => {
                        const active = persona === p.key
                        return (
                            <button
                                key={p.key}
                                onClick={() => setPersona(p.key)}
                                style={{
                                    padding: '6px 14px', borderRadius: 20, flexShrink: 0,
                                    border: `1px solid ${active ? 'var(--accent)' : 'var(--glass-border)'}`,
                                    background: active ? 'rgba(201,169,110,0.15)' : 'transparent',
                                    color: active ? 'var(--accent)' : 'var(--text-muted)',
                                    fontSize: 12, fontWeight: active ? 700 : 500,
                                    cursor: 'pointer', transition: 'all 0.2s ease',
                                }}
                            >
                                {p.emoji} {lang === 'bm' ? p.labelBM : p.labelEN}
                            </button>
                        )
                    })}
                    {messages.length > 0 && (
                        <button
                            onClick={() => setShowClear(true)}
                            style={{
                                marginLeft: 'auto', padding: '6px 12px', borderRadius: 20, flexShrink: 0,
                                border: '1px solid rgba(248,113,113,0.3)',
                                background: 'transparent', color: '#f87171',
                                fontSize: 12, cursor: 'pointer',
                            }}
                        >
                            🗑 {t('chatClearBtn')}
                        </button>
                    )}
                </div>
            </div>

            {/* Messages area */}
            <div style={{
                flex: 1, overflowY: 'auto',
                maxWidth: 480, margin: '0 auto', width: '100%',
                padding: '16px 16px 100px',
            }}>
                {loading ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingTop: 12 }}>
                        {[1, 2, 3].map(i => <SkeletonCard key={i} height={60} />)}
                    </div>
                ) : messages.length === 0 ? (
                    <div style={{ textAlign: 'center', paddingTop: 60, animation: 'sakinahSlideUp 0.4s ease' }}>
                        <div style={{ fontSize: 52, marginBottom: 16 }}>🕌</div>
                        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, color: 'var(--text-primary)', marginBottom: 10 }}>
                            {t('chatEmptyTitle')}
                        </h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: 14, lineHeight: 1.7, maxWidth: 300, margin: '0 auto' }}>
                            {t('chatEmptySub')}
                        </p>
                    </div>
                ) : (
                    <>
                        {items.map(item => {
                            if (item.type === 'divider') {
                                return (
                                    <div key={item.key} style={{ textAlign: 'center', margin: '16px 0', color: 'var(--text-muted)', fontSize: 11, fontWeight: 600, letterSpacing: '0.05em' }}>
                                        — {formatDateDivider(item.date)} —
                                    </div>
                                )
                            }
                            const { msg } = item
                            const isUser = msg.role === 'user'
                            return (
                                <div key={item.key} style={{
                                    display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start',
                                    marginBottom: 12, animation: 'sakinahSlideUp 0.3s ease',
                                }}>
                                    {!isUser && (
                                        <div style={{
                                            width: 32, height: 32, borderRadius: '50%',
                                            background: 'rgba(201,169,110,0.15)',
                                            border: '1px solid rgba(201,169,110,0.3)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: 14, marginRight: 8, flexShrink: 0, alignSelf: 'flex-end',
                                        }}>
                                            {PERSONAS[msg.persona || 'balanced']?.emoji || '🕌'}
                                        </div>
                                    )}
                                    <div style={bubbleStyle(msg.role)}>
                                        {msg.content}
                                    </div>
                                </div>
                            )
                        })}
                    </>
                )}

                {/* Typing indicator */}
                {sending && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, animation: 'sakinahSlideUp 0.3s ease' }}>
                        <div style={{
                            width: 32, height: 32, borderRadius: '50%',
                            background: 'rgba(201,169,110,0.15)',
                            border: '1px solid rgba(201,169,110,0.3)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
                        }}>
                            {PERSONAS[persona]?.emoji || '🕌'}
                        </div>
                        <div style={{
                            background: 'var(--bg-card)', border: '1px solid var(--glass-border)',
                            borderRadius: '18px 18px 18px 4px',
                            padding: '12px 16px', display: 'flex', gap: 4, alignItems: 'center',
                        }}>
                            {[0, 1, 2].map(i => (
                                <span key={i} style={{
                                    width: 7, height: 7, borderRadius: '50%', background: 'var(--accent)',
                                    display: 'inline-block',
                                    animation: 'sakinahBounce 1.2s infinite',
                                    animationDelay: `${i * 0.15}s`,
                                }} />
                            ))}
                        </div>
                    </div>
                )}

                {error && (
                    <div style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: 10, padding: '10px 14px', marginBottom: 12, color: 'var(--error)', fontSize: 13 }}>
                        ⚠️ {error}
                        <button onClick={() => setError(null)} style={{ marginLeft: 10, background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontSize: 12 }}>✕</button>
                    </div>
                )}

                <div ref={bottomRef} />
            </div>

            {/* Input bar */}
            <div style={{
                position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
                width: '100%', maxWidth: 480,
                background: 'var(--bg-secondary)',
                borderTop: '1px solid var(--glass-border)',
                padding: '12px 16px', paddingBottom: 'calc(12px + env(safe-area-inset-bottom, 0px))',
                backdropFilter: 'blur(20px)',
            }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
                    <textarea
                        ref={inputRef}
                        value={inputText}
                        onChange={e => setInputText(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={t('chatInputPlaceholder')}
                        disabled={sending}
                        rows={1}
                        style={{
                            flex: 1, padding: '11px 14px',
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid var(--glass-border)',
                            borderRadius: 12, color: 'var(--text-primary)',
                            fontSize: 14, outline: 'none', fontFamily: 'inherit',
                            resize: 'none', lineHeight: 1.5, maxHeight: 120, overflowY: 'auto',
                            transition: 'border-color 0.2s',
                        }}
                        onFocus={e => e.currentTarget.style.borderColor = 'var(--accent)'}
                        onBlur={e => e.currentTarget.style.borderColor = 'var(--glass-border)'}
                    />
                    <button
                        onClick={handleSend}
                        disabled={sending || !inputText.trim()}
                        style={{
                            width: 44, height: 44, borderRadius: 12,
                            background: sending || !inputText.trim() ? 'var(--bg-card)' : 'var(--accent-gradient)',
                            border: 'none', cursor: sending || !inputText.trim() ? 'not-allowed' : 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            transition: 'all 0.2s ease', opacity: sending || !inputText.trim() ? 0.5 : 1,
                            flexShrink: 0,
                        }}
                        onMouseEnter={e => { if (!sending && inputText.trim()) e.currentTarget.style.opacity = '0.85' }}
                        onMouseLeave={e => e.currentTarget.style.opacity = sending || !inputText.trim() ? '0.5' : '1'}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="22" y1="2" x2="11" y2="13" />
                            <polygon points="22 2 15 22 11 13 2 9 22 2" />
                        </svg>
                    </button>
                </div>
            </div>

            {showClear && (
                <ConfirmModal
                    message={t('chatClearConfirm')}
                    confirmLabel={t('chatClearConfirmBtn')}
                    cancelLabel={t('chatClearCancelBtn')}
                    onConfirm={handleClearHistory}
                    onCancel={() => setShowClear(false)}
                    danger
                />
            )}
        </div>
    )
}
