// Sakinah — Chat Page (Stoic style)
// User bubble: surface bg + gold left border. Assistant: bare bg.

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import { PERSONAS } from '../data/personas'
import { supabase } from '../lib/supabase'
import { sendToGeminiStream } from '../lib/gemini'
import BottomNav from '../components/BottomNav'
import ConfirmModal from '../components/ConfirmModal'

function SendIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
        </svg>
    )
}

export default function ChatPage() {
    const { user, profile } = useAuth()
    const { t, lang } = useLanguage()
    const [messages, setMessages] = useState([])
    const [input, setInput] = useState('')
    const [loading, setLoading] = useState(false)
    const [streaming, setStreaming] = useState(false)
    const [error, setError] = useState(null)
    const [showClear, setShowClear] = useState(false)
    const [persona, setPersona] = useState(profile?.preferred_persona || 'balanced')
    const [msgLoading, setMsgLoading] = useState(true)
    const bottomRef = useRef(null)
    const textareaRef = useRef(null)

    useEffect(() => { loadMessages() }, [user?.id])
    useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

    async function loadMessages() {
        if (!user?.id) return
        setMsgLoading(true)
        const { data } = await supabase.from('chat_messages').select('*')
            .eq('user_id', user.id).order('created_at', { ascending: true }).limit(100)
        setMessages(data || [])
        setMsgLoading(false)
    }

    async function handleSend() {
        if (!input.trim() || loading || streaming) return
        const text = input.trim()
        setInput('')
        setError(null)

        const userMsg = { id: Date.now(), role: 'user', content: text, created_at: new Date().toISOString() }
        setMessages(prev => [...prev, userMsg])

        // Persist user message
        supabase.from('chat_messages').insert({ user_id: user.id, role: 'user', content: text, persona }).then()

        const aiMsg = { id: Date.now() + 1, role: 'assistant', content: '', created_at: new Date().toISOString() }
        setMessages(prev => [...prev, aiMsg])
        setStreaming(true)

        try {
            const history = [...messages, userMsg].map(m => ({ role: m.role, parts: [{ text: m.content }] }))
            const systemPrompt = PERSONAS[persona]?.systemPrompt || PERSONAS.balanced.systemPrompt
            let fullText = ''
            await sendToGeminiStream(history, systemPrompt, (chunk) => {
                fullText += chunk
                setMessages(prev => prev.map(m => m.id === aiMsg.id ? { ...m, content: fullText } : m))
            })
            supabase.from('chat_messages').insert({ user_id: user.id, role: 'assistant', content: fullText, persona }).then()
        } catch (err) {
            setError(t('chatError'))
            setMessages(prev => prev.filter(m => m.id !== aiMsg.id))
        } finally {
            setStreaming(false)
            setLoading(false)
        }
    }

    async function handleClear() {
        await supabase.from('chat_messages').delete().eq('user_id', user.id)
        setMessages([])
        setShowClear(false)
    }

    const personaList = Object.values(PERSONAS)

    return (
        <>
            <div style={{ minHeight: '100dvh', background: 'var(--bg)', display: 'flex', flexDirection: 'column', maxWidth: 480, margin: '0 auto' }}>

                {/* Header */}
                <div style={{
                    padding: 'calc(48px + env(safe-area-inset-top, 0px)) 20px 0',
                    flexShrink: 0,
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 600, color: 'var(--text)' }}>
                            {lang === 'bm' ? 'Perbualan' : 'Chat'}
                        </h1>
                        {messages.length > 0 && (
                            <button onClick={() => setShowClear(true)} style={{
                                background: 'none', border: 'none', color: 'var(--text-muted)',
                                fontSize: 13, cursor: 'pointer', fontFamily: 'Noto Sans, sans-serif',
                                paddingTop: 6,
                            }}>
                                {t('chatClearBtn')}
                            </button>
                        )}
                    </div>

                    {/* Persona row */}
                    <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4, marginBottom: 16, scrollbarWidth: 'none' }}>
                        {personaList.map(p => {
                            const active = persona === p.key
                            return (
                                <button key={p.key} onClick={() => setPersona(p.key)} style={{
                                    flexShrink: 0, padding: '7px 16px', borderRadius: 20,
                                    border: `0.5px solid ${active ? 'var(--gold)' : 'var(--border)'}`,
                                    background: 'var(--surface)', cursor: 'pointer',
                                    color: active ? 'var(--gold)' : 'var(--text-sub)',
                                    fontWeight: active ? 600 : 400,
                                    fontSize: 13, fontFamily: 'Noto Sans, sans-serif',
                                    transition: 'all 0.15s ease',
                                    whiteSpace: 'nowrap',
                                }}>
                                    {lang === 'bm' ? p.labelBM : p.labelEN}
                                </button>
                            )
                        })}
                    </div>
                </div>

                {/* Messages */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px' }}>
                    {msgLoading ? (
                        <div style={{ padding: '40px 0', display: 'flex', justifyContent: 'center', gap: 8 }}>
                            {[0, 1, 2].map(i => <span key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--gold)', display: 'inline-block', animation: 'bounce 1.2s infinite', animationDelay: `${i * 0.2}s` }} />)}
                        </div>
                    ) : messages.length === 0 ? (
                        <div style={{ padding: '60px 0', textAlign: 'center' }}>
                            <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, color: 'var(--text)', marginBottom: 10 }}>
                                {t('chatEmptyTitle')}
                            </p>
                            <p style={{ color: 'var(--text-sub)', fontSize: 14, lineHeight: 1.7 }}>{t('chatEmptySub')}</p>
                        </div>
                    ) : (
                        <div style={{ paddingTop: 12, paddingBottom: 12 }}>
                            {messages.map(msg => (
                                <div key={msg.id} style={{
                                    marginBottom: 16,
                                    display: 'flex',
                                    flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
                                }}>
                                    {msg.role === 'user' ? (
                                        // User: surface bg + gold left border
                                        <div style={{
                                            background: 'var(--surface)',
                                            borderLeft: '2px solid var(--gold)',
                                            borderRadius: '16px 16px 4px 16px',
                                            padding: '12px 16px',
                                            maxWidth: '78%',
                                            color: 'var(--text)', fontSize: 15, lineHeight: 1.6,
                                            fontFamily: 'Noto Sans, sans-serif',
                                        }}>
                                            {msg.content}
                                        </div>
                                    ) : (
                                        // Assistant: just bare, no background
                                        <div style={{
                                            maxWidth: '88%', padding: '4px 0',
                                            color: msg.content ? 'var(--text)' : 'var(--text-muted)',
                                            fontSize: 15, lineHeight: 1.75,
                                            fontFamily: 'Noto Sans, sans-serif',
                                        }}>
                                            {msg.content || (
                                                <span style={{ display: 'flex', gap: 6, alignItems: 'center', marginTop: 4 }}>
                                                    {[0, 1, 2].map(i => <span key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--gold)', display: 'inline-block', animation: 'bounce 1.2s infinite', animationDelay: `${i * 0.2}s` }} />)}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                            {error && (
                                <div style={{ color: 'var(--error)', fontSize: 13, marginBottom: 12, textAlign: 'center' }}>{error}</div>
                            )}
                            <div ref={bottomRef} />
                        </div>
                    )}
                </div>

                {/* Input bar */}
                <div style={{
                    flexShrink: 0, padding: '10px 16px',
                    paddingBottom: 'calc(76px + env(safe-area-inset-bottom, 8px))',
                    borderTop: '0.5px solid var(--border)',
                    background: 'var(--bg)',
                }}>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
                        <textarea ref={textareaRef} value={input} onChange={e => setInput(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
                            placeholder={t('chatInputPlaceholder')}
                            rows={1}
                            style={{
                                flex: 1, padding: '12px 14px',
                                background: 'var(--surface)', border: '0.5px solid var(--border)',
                                borderRadius: 22, color: 'var(--text)', resize: 'none',
                                fontFamily: 'Noto Sans, sans-serif', fontSize: 15, outline: 'none',
                                lineHeight: 1.5, maxHeight: 120, overflowY: 'auto',
                                transition: 'border-color 0.2s',
                            }}
                            onFocus={e => e.currentTarget.style.borderColor = 'var(--gold)'}
                            onBlur={e => e.currentTarget.style.borderColor = 'var(--border)'}
                        />
                        <button onClick={handleSend} disabled={!input.trim() || loading || streaming} style={{
                            width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
                            background: 'var(--gold)', border: 'none', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#1A160B', opacity: (!input.trim() || loading || streaming) ? 0.4 : 1,
                            transition: 'opacity 0.15s ease',
                        }}>
                            <SendIcon />
                        </button>
                    </div>
                </div>
            </div>

            {showClear && <ConfirmModal
                message={t('chatClearConfirm')} confirmLabel={t('chatClearConfirmBtn')} cancelLabel={t('chatClearCancelBtn')}
                onConfirm={handleClear} onCancel={() => setShowClear(false)} danger />}
            <BottomNav />
        </>
    )
}
