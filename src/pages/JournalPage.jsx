// Sakinah — Journal Page (Stoic style)
// Clean cards, tag text only, no pill backgrounds

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import { supabase } from '../lib/supabase'
import BottomNav from '../components/BottomNav'
import ConfirmModal from '../components/ConfirmModal'
import { SkeletonCard } from '../components/SkeletonLoader'

const PAGE_SIZE = 10
const MOODS = ['', '😞', '😟', '😐', '🙂', '😊']

function PlusIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
        </svg>
    )
}
function SearchIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
    )
}

export default function JournalPage() {
    const { user } = useAuth()
    const { t, lang } = useLanguage()
    const [entries, setEntries] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [search, setSearch] = useState('')
    const [page, setPage] = useState(0)
    const [hasMore, setHasMore] = useState(false)
    const [showForm, setShowForm] = useState(false)
    const [editing, setEditing] = useState(null)
    const [deleteId, setDeleteId] = useState(null)
    const [saving, setSaving] = useState(false)
    const [formError, setFormError] = useState(null)

    // Form state
    const [fTitle, setFTitle] = useState('')
    const [fContent, setFContent] = useState('')
    const [fMood, setFMood] = useState(0)
    const [fTags, setFTags] = useState('')

    const load = useCallback(async (reset = false) => {
        if (!user?.id) return
        setLoading(true); setError(null)
        const offset = reset ? 0 : page * PAGE_SIZE
        let q = supabase.from('journal_entries').select('*', { count: 'exact' })
            .eq('user_id', user.id).order('created_at', { ascending: false })
            .range(offset, offset + PAGE_SIZE - 1)
        if (search) q = q.or(`title.ilike.%${search}%,content.ilike.%${search}%`)
        const { data, count, error: err } = await q
        if (err) { setError(t('journalError')); setLoading(false); return }
        setEntries(reset ? (data || []) : prev => [...prev, ...(data || [])])
        setHasMore((offset + PAGE_SIZE) < (count || 0))
        setLoading(false)
    }, [user?.id, page, search])

    useEffect(() => { setPage(0); load(true) }, [search, user?.id])

    function openCreate() {
        setEditing(null); setFTitle(''); setFContent(''); setFMood(0); setFTags('')
        setFormError(null); setShowForm(true)
    }
    function openEdit(e) {
        setEditing(e); setFTitle(e.title || ''); setFContent(e.content); setFMood(e.mood || 0)
        setFTags((e.tags || []).join(', ')); setFormError(null); setShowForm(true)
    }
    async function handleSave() {
        if (!fContent.trim()) { setFormError(t('journalFormContent')); return }
        setSaving(true); setFormError(null)
        const tags = fTags.split(',').map(x => x.trim()).filter(Boolean)
        const payload = { title: fTitle.trim() || null, content: fContent.trim(), mood: fMood || null, tags }
        const { error: err } = editing
            ? await supabase.from('journal_entries').update({ ...payload, updated_at: new Date().toISOString() }).eq('id', editing.id)
            : await supabase.from('journal_entries').insert({ ...payload, user_id: user.id })
        if (err) { setFormError(t('journalSaveError')); setSaving(false); return }
        setSaving(false); setShowForm(false); load(true)
    }
    async function handleDelete(id) {
        await supabase.from('journal_entries').delete().eq('id', id)
        setDeleteId(null); load(true)
    }

    const inputStyle = {
        width: '100%', padding: '13px 14px', borderRadius: 12,
        background: 'var(--surface)', border: '0.5px solid var(--border)',
        color: 'var(--text)', fontSize: 15, outline: 'none',
        fontFamily: 'Noto Sans, sans-serif', marginBottom: 12,
        transition: 'border-color 0.2s',
    }

    return (
        <>
            <div style={{ minHeight: '100dvh', background: 'var(--bg)', paddingTop: 48, paddingBottom: 96, maxWidth: 480, margin: '0 auto' }}>
                <div style={{ padding: '0 20px' }}>

                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 600, color: 'var(--text)' }}>
                            {t('journalTitle')}
                        </h1>
                        <button onClick={openCreate} style={{
                            width: 40, height: 40, borderRadius: '50%',
                            background: 'var(--gold)', border: 'none',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer', color: '#1A160B',
                        }}>
                            <PlusIcon />
                        </button>
                    </div>

                    {/* Search */}
                    <div style={{ position: 'relative', marginBottom: 24 }}>
                        <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }}>
                            <SearchIcon />
                        </div>
                        <input value={search} onChange={e => setSearch(e.target.value)}
                            placeholder={t('journalSearchPlaceholder')}
                            style={{ ...inputStyle, paddingLeft: 38, marginBottom: 0 }}
                            onFocus={e => e.currentTarget.style.borderColor = 'var(--gold)'}
                            onBlur={e => e.currentTarget.style.borderColor = 'var(--border)'}
                        />
                    </div>

                    {/* Entries */}
                    {loading && entries.length === 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {[1, 2, 3].map(i => <SkeletonCard key={i} height={100} />)}
                        </div>
                    ) : error ? (
                        <div style={{ textAlign: 'center', padding: 40 }}>
                            <p style={{ color: 'var(--error)', marginBottom: 12 }}>{error}</p>
                            <button onClick={() => load(true)} style={{ color: 'var(--gold)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14 }}>{t('retry')}</button>
                        </div>
                    ) : entries.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '60px 0' }}>
                            <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, color: 'var(--text)', marginBottom: 8 }}>
                                {search ? t('journalNoResults') : t('journalNoEntries')}
                            </p>
                            {!search && <p style={{ color: 'var(--text-sub)', fontSize: 14 }}>{t('journalNoEntriesSub')}</p>}
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {entries.map(entry => {
                                const date = new Date(entry.created_at)
                                const dateStr = date.toLocaleDateString(lang === 'bm' ? 'ms-MY' : 'en-MY', { day: 'numeric', month: 'short', year: 'numeric' })
                                return (
                                    <div key={entry.id} onClick={() => openEdit(entry)} style={{
                                        background: 'var(--card)', borderRadius: 14, padding: 18,
                                        cursor: 'pointer', boxShadow: 'var(--shadow-card)',
                                        transition: 'background 0.15s ease',
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                {entry.title && (
                                                    <div style={{ fontWeight: 600, color: 'var(--text)', fontSize: 15, marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                        {entry.title}
                                                    </div>
                                                )}
                                                <div style={{ color: 'var(--text-sub)', fontSize: 14, lineHeight: 1.55, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                                                    {entry.content}
                                                </div>
                                            </div>
                                            {entry.mood > 0 && (
                                                <span style={{ fontSize: 20, marginLeft: 12, flexShrink: 0 }}>{MOODS[entry.mood]}</span>
                                            )}
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
                                            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                                                {(entry.tags || []).map(tag => (
                                                    <span key={tag} style={{
                                                        fontSize: 12, color: 'var(--text-muted)',
                                                        borderBottom: '1px solid var(--gold)',
                                                        paddingBottom: 1, fontFamily: 'Noto Sans, sans-serif',
                                                    }}>{tag}</span>
                                                ))}
                                            </div>
                                            <span style={{ fontSize: 12, color: 'var(--text-muted)', flexShrink: 0 }}>{dateStr}</span>
                                        </div>
                                    </div>
                                )
                            })}
                            {hasMore && (
                                <button onClick={() => { const next = page + 1; setPage(next); load() }} style={{
                                    width: '100%', padding: '14px 0', marginTop: 4,
                                    background: 'none', border: '0.5px solid var(--border)',
                                    borderRadius: 12, color: 'var(--text-sub)', fontSize: 14,
                                    cursor: 'pointer', fontFamily: 'Noto Sans, sans-serif',
                                }}>
                                    {t('journalLoadMore')}
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Entry form — bottom sheet */}
            {showForm && (
                <>
                    <div onClick={() => setShowForm(false)} style={{ position: 'fixed', inset: 0, zIndex: 8000, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }} />
                    <div style={{
                        position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
                        width: '100%', maxWidth: 480, background: 'var(--card)',
                        borderRadius: '20px 20px 0 0',
                        padding: '12px 20px', paddingBottom: 'calc(16px + env(safe-area-inset-bottom, 0px))',
                        maxHeight: '92vh', overflowY: 'auto',
                        zIndex: 8001, animation: 'slideUpSheet 0.3s ease',
                    }}>
                        <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--border)', margin: '0 auto 20px' }} />
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 600, color: 'var(--text)' }}>
                                {editing ? t('journalEditTitle') : t('journalCreateTitle')}
                            </h2>
                            {editing && (
                                <button onClick={() => setDeleteId(editing.id)} style={{ background: 'none', border: 'none', color: 'var(--error)', cursor: 'pointer', fontSize: 14, fontFamily: 'Noto Sans, sans-serif' }}>
                                    {t('delete')}
                                </button>
                            )}
                        </div>

                        <input value={fTitle} onChange={e => setFTitle(e.target.value)}
                            placeholder={t('journalFormTitlePlaceholder')} style={inputStyle}
                            onFocus={e => e.currentTarget.style.borderColor = 'var(--gold)'}
                            onBlur={e => e.currentTarget.style.borderColor = 'var(--border)'} />
                        <textarea value={fContent} onChange={e => setFContent(e.target.value)}
                            placeholder={t('journalFormContentPlaceholder')} rows={5}
                            style={{ ...inputStyle, resize: 'vertical' }}
                            onFocus={e => e.currentTarget.style.borderColor = 'var(--gold)'}
                            onBlur={e => e.currentTarget.style.borderColor = 'var(--border)'} />

                        {/* Mood */}
                        <div style={{ marginBottom: 16 }}>
                            <div style={{ fontSize: 13, color: 'var(--text-sub)', marginBottom: 10 }}>{t('journalFormMood')}</div>
                            <div style={{ display: 'flex', gap: 12 }}>
                                {MOODS.slice(1).map((emoji, i) => (
                                    <button key={i + 1} onClick={() => setFMood(fMood === i + 1 ? 0 : i + 1)} style={{
                                        fontSize: 26, background: 'none', border: 'none', cursor: 'pointer',
                                        opacity: fMood === 0 || fMood === i + 1 ? 1 : 0.3,
                                        transform: fMood === i + 1 ? 'scale(1.3)' : 'scale(1)',
                                        transition: 'all 0.15s ease',
                                    }}>
                                        {emoji}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <input value={fTags} onChange={e => setFTags(e.target.value)}
                            placeholder={t('journalFormTagsPlaceholder')} style={inputStyle}
                            onFocus={e => e.currentTarget.style.borderColor = 'var(--gold)'}
                            onBlur={e => e.currentTarget.style.borderColor = 'var(--border)'} />

                        {formError && <p style={{ color: 'var(--error)', fontSize: 13, marginBottom: 12 }}>{formError}</p>}

                        <div style={{ display: 'flex', gap: 10 }}>
                            <button onClick={() => setShowForm(false)} style={{
                                flex: 1, padding: '14px 0', borderRadius: 12,
                                border: '0.5px solid var(--border)', background: 'transparent',
                                color: 'var(--text-sub)', fontSize: 15, cursor: 'pointer',
                                fontFamily: 'Noto Sans, sans-serif',
                            }}>{t('cancel')}</button>
                            <button onClick={handleSave} disabled={saving} style={{
                                flex: 2, padding: '14px 0', borderRadius: 12, border: 'none',
                                background: 'var(--gold)', color: '#1A160B',
                                fontWeight: 600, fontSize: 15, cursor: 'pointer',
                                fontFamily: 'Noto Sans, sans-serif', opacity: saving ? 0.7 : 1,
                            }}>
                                {saving ? '...' : editing ? t('journalUpdateBtn') : t('journalSaveBtn')}
                            </button>
                        </div>
                    </div>
                </>
            )}

            {deleteId && (
                <ConfirmModal message={t('journalDeleteConfirm')} confirmLabel={t('delete')} cancelLabel={t('cancel')}
                    onConfirm={() => handleDelete(deleteId)} onCancel={() => setDeleteId(null)} danger />
            )}
            <BottomNav />
        </>
    )
}
