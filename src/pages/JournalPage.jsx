// Sakinah سكينة — Journal Page (full inline styles)
// Full CRUD: create, read, update, delete entries. Search, pagination, mood emoji, tags.

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import { supabase } from '../lib/supabase'
import Navbar from '../components/Navbar'
import ConfirmModal from '../components/ConfirmModal'
import { SkeletonCard } from '../components/SkeletonLoader'

const PAGE_SIZE = 10
const MOOD_EMOJIS = ['', '😞', '😟', '😐', '🙂', '😊']

const BM_MONTHS = ['Januari', 'Februari', 'Mac', 'April', 'Mei', 'Jun', 'Julai', 'Ogos', 'September', 'Oktober', 'November', 'Disember']

function formatDate(dateStr, lang) {
    const d = new Date(dateStr)
    if (lang === 'bm') return `${d.getDate()} ${BM_MONTHS[d.getMonth()]} ${d.getFullYear()}`
    return d.toLocaleDateString('en-MY', { day: 'numeric', month: 'long', year: 'numeric' })
}

function truncate(text, len = 120) {
    if (!text || text.length <= len) return text
    return text.slice(0, len).trimEnd() + '…'
}

// ── Entry Form Modal ──────────────────────────────────────────────────────────
function EntryModal({ entry, onClose, onSave, t }) {
    const [title, setTitle] = useState(entry?.title || '')
    const [content, setContent] = useState(entry?.content || '')
    const [mood, setMood] = useState(entry?.mood || 0)
    const [tags, setTags] = useState(entry?.tags?.join(', ') || '')
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState(null)
    const isEdit = Boolean(entry?.id)

    async function handleSave() {
        if (!content.trim()) { setError(t('journalFormContent') + ' (required)'); return }
        setSaving(true)
        try {
            await onSave({ title: title.trim() || null, content: content.trim(), mood: mood || null, tags: tags ? tags.split(',').map(s => s.trim()).filter(Boolean) : [] }, entry?.id)
            onClose()
        } catch (err) {
            setError(err.message || t('journalSaveError'))
        } finally {
            setSaving(false)
        }
    }

    const inputStyle = {
        width: '100%', padding: '11px 14px',
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid var(--glass-border)',
        borderRadius: 10, color: 'var(--text-primary)',
        fontSize: 14, outline: 'none', fontFamily: 'inherit',
        transition: 'border-color 0.2s',
    }

    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9000, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }} onClick={onClose}>
            <div style={{
                background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)', borderRadius: '20px 20px 0 0',
                padding: '16px 20px 32px', width: '100%', maxWidth: 480,
                maxHeight: '92vh', overflowY: 'auto', animation: 'sakinahSlideUp 0.3s ease',
            }} onClick={e => e.stopPropagation()}>
                <div style={{ width: 40, height: 4, background: 'var(--glass-border)', borderRadius: 2, margin: '0 auto 20px' }} />
                <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, color: 'var(--text-primary)', marginBottom: 20 }}>
                    {isEdit ? t('journalEditTitle') : t('journalCreateTitle')}
                </h2>

                {error && <p style={{ color: 'var(--error)', fontSize: 13, marginBottom: 12 }}>⚠️ {error}</p>}

                <div style={{ marginBottom: 14 }}>
                    <label style={{ color: 'var(--text-muted)', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: 6 }}>{t('journalFormTitle')}</label>
                    <input value={title} onChange={e => setTitle(e.target.value)} placeholder={t('journalFormTitlePlaceholder')} style={inputStyle}
                        onFocus={e => e.currentTarget.style.borderColor = 'var(--accent)'}
                        onBlur={e => e.currentTarget.style.borderColor = 'var(--glass-border)'} />
                </div>

                <div style={{ marginBottom: 14 }}>
                    <label style={{ color: 'var(--text-muted)', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: 6 }}>{t('journalFormContent')} *</label>
                    <textarea value={content} onChange={e => setContent(e.target.value)} placeholder={t('journalFormContentPlaceholder')} rows={6} style={{ ...inputStyle, resize: 'none', lineHeight: 1.7 }}
                        onFocus={e => e.currentTarget.style.borderColor = 'var(--accent)'}
                        onBlur={e => e.currentTarget.style.borderColor = 'var(--glass-border)'} />
                </div>

                <div style={{ marginBottom: 14 }}>
                    <label style={{ color: 'var(--text-muted)', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: 8 }}>{t('journalFormMood')}</label>
                    <div style={{ display: 'flex', gap: 10 }}>
                        {[1, 2, 3, 4, 5].map(n => (
                            <button key={n} onClick={() => setMood(mood === n ? 0 : n)} style={{
                                flex: 1, padding: '10px 0', borderRadius: 10,
                                border: `2px solid ${mood === n ? 'var(--accent)' : 'var(--glass-border)'}`,
                                background: mood === n ? 'rgba(201,169,110,0.15)' : 'transparent',
                                fontSize: 22, cursor: 'pointer', transition: 'all 0.2s ease',
                                transform: mood === n ? 'scale(1.1)' : 'scale(1)',
                            }}>{MOOD_EMOJIS[n]}</button>
                        ))}
                    </div>
                </div>

                <div style={{ marginBottom: 22 }}>
                    <label style={{ color: 'var(--text-muted)', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: 6 }}>{t('journalFormTags')}</label>
                    <input value={tags} onChange={e => setTags(e.target.value)} placeholder={t('journalFormTagsPlaceholder')} style={inputStyle}
                        onFocus={e => e.currentTarget.style.borderColor = 'var(--accent)'}
                        onBlur={e => e.currentTarget.style.borderColor = 'var(--glass-border)'} />
                </div>

                <div style={{ display: 'flex', gap: 10 }}>
                    <button onClick={onClose} style={{ flex: 1, padding: '12px 0', borderRadius: 10, border: '1px solid var(--glass-border)', background: 'transparent', color: 'var(--text-secondary)', fontSize: 14, cursor: 'pointer' }}>
                        {t('journalCancelBtn')}
                    </button>
                    <button onClick={handleSave} disabled={saving} style={{ flex: 2, padding: '12px 0', borderRadius: 10, border: 'none', background: 'var(--accent-gradient)', color: 'white', fontWeight: 700, fontSize: 15, cursor: 'pointer', opacity: saving ? 0.7 : 1 }}>
                        {saving ? '...' : (isEdit ? t('journalUpdateBtn') : t('journalSaveBtn'))}
                    </button>
                </div>
            </div>
        </div>
    )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function JournalPage() {
    const { user } = useAuth()
    const { lang, t } = useLanguage()
    const [entries, setEntries] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [search, setSearch] = useState('')
    const [page, setPage] = useState(1)
    const [editEntry, setEditEntry] = useState(null)  // null = closed, {} = new, {...} = edit
    const [showModal, setShowModal] = useState(false)
    const [deleteId, setDeleteId] = useState(null)

    const loadEntries = useCallback(async () => {
        if (!user) return
        setLoading(true)
        setError(null)
        try {
            const { data, error } = await supabase
                .from('journal_entries')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
            if (error) throw error
            setEntries(data || [])
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }, [user])

    useEffect(() => { loadEntries() }, [loadEntries])

    // Client-side search filter
    const filtered = useMemo(() => {
        if (!search.trim()) return entries
        const q = search.toLowerCase()
        return entries.filter(e =>
            e.content?.toLowerCase().includes(q) ||
            e.title?.toLowerCase().includes(q)
        )
    }, [entries, search])

    const paginated = filtered.slice(0, page * PAGE_SIZE)
    const hasMore = paginated.length < filtered.length

    async function handleSave(data, id) {
        if (id) {
            // Update
            const { error } = await supabase.from('journal_entries').update(data).eq('id', id).eq('user_id', user.id)
            if (error) throw error
            setEntries(prev => prev.map(e => e.id === id ? { ...e, ...data } : e))
        } else {
            // Create
            const optimisticId = `opt-${Date.now()}`
            const optimistic = { id: optimisticId, user_id: user.id, ...data, created_at: new Date().toISOString() }
            setEntries(prev => [optimistic, ...prev])
            try {
                const { data: saved, error } = await supabase.from('journal_entries').insert({ user_id: user.id, ...data }).select().single()
                if (error) throw error
                setEntries(prev => prev.map(e => e.id === optimisticId ? saved : e))
            } catch (err) {
                setEntries(prev => prev.filter(e => e.id !== optimisticId))
                throw err
            }
        }
    }

    async function handleDelete(id) {
        setEntries(prev => prev.filter(e => e.id !== id))
        try {
            const { error } = await supabase.from('journal_entries').delete().eq('id', id).eq('user_id', user.id)
            if (error) throw error
        } catch {
            loadEntries()
        }
        setDeleteId(null)
    }

    const cardStyle = {
        background: 'var(--bg-card)',
        backdropFilter: 'blur(20px)',
        border: '1px solid var(--glass-border)',
        borderRadius: 16, padding: '14px 16px',
        cursor: 'pointer', transition: 'all 0.2s ease',
        animation: 'sakinahSlideUp 0.3s ease',
    }

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', flexDirection: 'column' }}>
            <Navbar />
            <main style={{ flex: 1, maxWidth: 480, margin: '0 auto', padding: '20px 16px 40px', width: '100%' }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                    <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 800, color: 'var(--text-primary)' }}>
                        {t('journalTitle')}
                    </h1>
                    <button
                        onClick={() => { setEditEntry({}); setShowModal(true) }}
                        style={{ background: 'var(--accent-gradient)', border: 'none', color: 'white', fontWeight: 700, fontSize: 13, padding: '9px 16px', borderRadius: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
                    >
                        + {t('journalNewEntry')}
                    </button>
                </div>

                {/* Search */}
                <div style={{ marginBottom: 16, position: 'relative' }}>
                    <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: 16 }}>🔍</span>
                    <input
                        value={search}
                        onChange={e => { setSearch(e.target.value); setPage(1) }}
                        placeholder={t('journalSearchPlaceholder')}
                        style={{
                            width: '100%', padding: '11px 14px 11px 36px',
                            background: 'var(--bg-card)', border: '1px solid var(--glass-border)',
                            borderRadius: 12, color: 'var(--text-primary)', fontSize: 14, outline: 'none', fontFamily: 'inherit',
                        }}
                        onFocus={e => e.currentTarget.style.borderColor = 'var(--accent)'}
                        onBlur={e => e.currentTarget.style.borderColor = 'var(--glass-border)'}
                    />
                </div>

                {/* Content */}
                {loading ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {[1, 2, 3].map(i => <SkeletonCard key={i} height={90} />)}
                    </div>
                ) : error ? (
                    <div style={{ textAlign: 'center', padding: 32 }}>
                        <p style={{ color: 'var(--error)', fontSize: 14, marginBottom: 12 }}>⚠️ {error}</p>
                        <button onClick={loadEntries} style={{ background: 'var(--accent-gradient)', border: 'none', color: 'white', padding: '9px 20px', borderRadius: 10, cursor: 'pointer' }}>{t('retry')}</button>
                    </div>
                ) : filtered.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '48px 20px' }}>
                        <p style={{ fontSize: 40, marginBottom: 12 }}>📔</p>
                        <p style={{ color: 'var(--text-primary)', fontWeight: 700, marginBottom: 6 }}>
                            {search ? t('journalNoResults') : t('journalNoEntries')}
                        </p>
                        {!search && <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>{t('journalNoEntriesSub')}</p>}
                    </div>
                ) : (
                    <>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {paginated.map(entry => (
                                <div
                                    key={entry.id}
                                    style={cardStyle}
                                    onClick={() => { setEditEntry(entry); setShowModal(true) }}
                                    onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(201,169,110,0.4)'}
                                    onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--glass-border)'}
                                >
                                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 6 }}>
                                        <div style={{ flex: 1 }}>
                                            {entry.title && (
                                                <p style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: 14, marginBottom: 2 }}>{entry.title}</p>
                                            )}
                                            <p style={{ color: 'var(--text-muted)', fontSize: 11 }}>{formatDate(entry.created_at, lang)}</p>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            {entry.mood && <span style={{ fontSize: 20 }}>{MOOD_EMOJIS[entry.mood]}</span>}
                                            <button
                                                onClick={e => { e.stopPropagation(); setDeleteId(entry.id) }}
                                                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 13, padding: '4px 6px', borderRadius: 6 }}
                                                onMouseEnter={e => e.currentTarget.style.color = '#f87171'}
                                                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                                            >
                                                🗑
                                            </button>
                                        </div>
                                    </div>
                                    <p style={{ color: 'var(--text-secondary)', fontSize: 13, lineHeight: 1.6 }}>
                                        {truncate(entry.content)}
                                    </p>
                                    {entry.tags?.length > 0 && (
                                        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginTop: 8 }}>
                                            {entry.tags.map(tag => (
                                                <span key={tag} style={{ background: 'rgba(201,169,110,0.1)', color: 'var(--accent)', fontSize: 10, padding: '2px 8px', borderRadius: 20, border: '1px solid rgba(201,169,110,0.2)' }}>
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {hasMore && (
                            <button
                                onClick={() => setPage(p => p + 1)}
                                style={{ width: '100%', marginTop: 14, padding: '12px 0', background: 'transparent', border: '1px solid var(--glass-border)', color: 'var(--text-secondary)', borderRadius: 12, fontSize: 14, cursor: 'pointer' }}
                                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
                                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--glass-border)'}
                            >
                                {t('journalLoadMore')} ({filtered.length - paginated.length})
                            </button>
                        )}
                    </>
                )}
            </main>

            {showModal && (
                <EntryModal
                    entry={editEntry}
                    onClose={() => { setShowModal(false); setEditEntry(null) }}
                    onSave={handleSave}
                    t={t}
                />
            )}

            {deleteId && (
                <ConfirmModal
                    message={t('journalDeleteConfirm')}
                    confirmLabel={t('journalDeleteBtn')}
                    cancelLabel={t('journalCancelBtn')}
                    onConfirm={() => handleDelete(deleteId)}
                    onCancel={() => setDeleteId(null)}
                    danger
                />
            )}
        </div>
    )
}
