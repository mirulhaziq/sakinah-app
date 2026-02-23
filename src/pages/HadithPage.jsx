// Sakinah — Hadith Page
// Full-screen reading view. Bookmark to Supabase. Scrollable collection.

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import { HADITH_COLLECTION } from '../data/hadith'
import { supabase } from '../lib/supabase'
import BottomNav from '../components/BottomNav'

function getDayOfYear() {
    const now = new Date()
    const start = new Date(now.getFullYear(), 0, 0)
    return Math.floor((now - start) / (1000 * 60 * 60 * 24))
}

function BookmarkIcon({ filled }) {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill={filled ? 'var(--gold)' : 'none'}
            stroke="var(--gold)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
        </svg>
    )
}

// HadithCard: defined OUTSIDE the page component to avoid remount on every render
function HadithCard({ hadith, showBookmark = true, fromSaved = false, savedIds, lang, onToggle, onRemove }) {
    const hadithId = fromSaved ? hadith.hadith_id : String(hadith.id)
    const isSaved = savedIds.has(hadithId)

    const arabic = hadith.arabic
    const translation = fromSaved
        ? hadith.translation
        : (lang === 'bm' ? hadith.malay : hadith.english)
    const narrator = fromSaved ? null : (lang === 'bm' ? hadith.narrator_bm : hadith.narrator_en)
    const source = fromSaved ? hadith.collection : (lang === 'bm' ? hadith.source_bm : hadith.source_en)
    const grade = fromSaved ? null : hadith.grade
    const topic = fromSaved ? null : hadith.topic

    function handleBookmark() {
        if (fromSaved) onRemove(hadithId)
        else onToggle(hadith)
    }

    return (
        <div style={{
            background: 'var(--card)', borderRadius: 16,
            boxShadow: 'var(--shadow-card)', marginBottom: 16,
            overflow: 'hidden',
        }}>
            {/* Card header */}
            <div style={{
                padding: '14px 20px 12px',
                borderBottom: '0.5px solid var(--border)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {topic && (
                        <span style={{
                            fontSize: 11, color: 'var(--text-muted)',
                            fontFamily: 'Noto Sans, sans-serif',
                            letterSpacing: '0.5px',
                            textTransform: 'capitalize',
                        }}>
                            {topic}
                        </span>
                    )}
                    {grade && (
                        <span style={{
                            fontSize: 10, padding: '2px 8px',
                            border: '0.5px solid var(--gold)',
                            borderRadius: 20, color: 'var(--gold)',
                            fontFamily: 'Noto Sans, sans-serif',
                        }}>
                            {grade}
                        </span>
                    )}
                </div>
                {showBookmark && (
                    <button
                        onClick={handleBookmark}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
                        aria-label={isSaved || fromSaved ? 'Remove bookmark' : 'Bookmark hadith'}
                    >
                        <BookmarkIcon filled={isSaved || fromSaved} />
                    </button>
                )}
            </div>

            {/* Arabic text */}
            <div style={{ padding: '20px 20px 18px' }}>
                <p style={{
                    fontFamily: "'Noto Naskh Arabic', serif",
                    fontSize: 22, lineHeight: 2,
                    color: 'var(--text)', direction: 'rtl',
                    textAlign: 'right', marginBottom: 18,
                }}>
                    {arabic}
                </p>

                {/* Translation */}
                <p style={{
                    color: 'var(--text-sub)', fontSize: 15,
                    lineHeight: 1.75, fontStyle: 'italic',
                    marginBottom: 16,
                }}>
                    &ldquo;{translation}&rdquo;
                </p>

                {/* Source */}
                <div style={{
                    borderTop: '0.5px solid var(--border)',
                    paddingTop: 14, display: 'flex',
                    flexDirection: 'column', gap: 4,
                }}>
                    {narrator && (
                        <p style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'Noto Sans, sans-serif' }}>
                            {narrator}
                        </p>
                    )}
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'Noto Sans, sans-serif' }}>
                        {source}
                    </p>
                </div>
            </div>
        </div>
    )
}

export default function HadithPage() {
    const { user } = useAuth()
    const { lang } = useLanguage()
    const [activeTab, setActiveTab] = useState('today')
    const [savedIds, setSavedIds] = useState(new Set())
    const [savedHadith, setSavedHadith] = useState([])
    const [loadingSaved, setLoadingSaved] = useState(false)

    const dayIdx = getDayOfYear() % HADITH_COLLECTION.length
    const todayHadith = HADITH_COLLECTION[dayIdx]

    const loadSaved = useCallback(async () => {
        if (!user?.id) return
        setLoadingSaved(true)
        const { data } = await supabase
            .from('saved_hadith')
            .select('*')
            .eq('user_id', user.id)
            .order('saved_at', { ascending: false })
        setSavedHadith(data || [])
        setSavedIds(new Set((data || []).map(h => h.hadith_id)))
        setLoadingSaved(false)
    }, [user?.id])

    useEffect(() => { loadSaved() }, [loadSaved])

    async function toggleBookmark(hadith) {
        if (!user?.id) return
        const id = String(hadith.id)
        if (savedIds.has(id)) {
            await supabase.from('saved_hadith').delete()
                .eq('user_id', user.id).eq('hadith_id', id)
            setSavedIds(prev => { const s = new Set(prev); s.delete(id); return s })
            setSavedHadith(prev => prev.filter(h => h.hadith_id !== id))
        } else {
            const row = {
                user_id: user.id, hadith_id: id,
                collection: hadith.book, arabic: hadith.arabic,
                translation: lang === 'bm' ? hadith.malay : hadith.english,
                saved_at: new Date().toISOString(),
            }
            const { data } = await supabase.from('saved_hadith').insert(row).select().single()
            setSavedIds(prev => new Set([...prev, id]))
            if (data) setSavedHadith(prev => [data, ...prev])
        }
    }

    async function removeSaved(hadithId) {
        await supabase.from('saved_hadith').delete()
            .eq('user_id', user.id).eq('hadith_id', hadithId)
        setSavedIds(prev => { const s = new Set(prev); s.delete(hadithId); return s })
        setSavedHadith(prev => prev.filter(h => h.hadith_id !== hadithId))
    }

    return (
        <>
            <div style={{
                minHeight: '100dvh',
                background: 'var(--bg)',
                paddingTop: 'calc(52px + env(safe-area-inset-top, 0px))',
                paddingBottom: 'calc(92px + env(safe-area-inset-bottom, 0px))',
                maxWidth: 480,
                margin: '0 auto',
                animation: 'slideUp 0.3s ease',
            }}>
                <div style={{ padding: '0 20px' }}>

                    {/* Header */}
                    <div style={{ marginBottom: 28 }}>
                        <h1 style={{
                            fontFamily: "'Playfair Display', serif",
                            fontSize: 28, fontWeight: 600,
                            color: 'var(--text)', marginBottom: 4,
                        }}>
                            {lang === 'bm' ? 'Koleksi Hadith' : 'Hadith Collection'}
                        </h1>
                        <p style={{ fontSize: 13, color: 'var(--text-muted)', fontFamily: 'Noto Sans, sans-serif' }}>
                            {lang === 'bm'
                                ? '40 hadith sahih pilihan untuk renungan harian'
                                : '40 authentic hadith for daily reflection'}
                        </p>
                    </div>

                    {/* Tabs */}
                    <div style={{
                        display: 'flex', marginBottom: 24,
                        border: '0.5px solid var(--border)', borderRadius: 12, overflow: 'hidden',
                    }}>
                        {[
                            { key: 'today', labelBM: 'Hari Ini', labelEN: "Today's" },
                            { key: 'saved', labelBM: 'Tersimpan', labelEN: 'Saved' },
                            { key: 'all', labelBM: 'Semua', labelEN: 'All' },
                        ].map((tab, i, arr) => (
                            <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
                                flex: 1, padding: '12px 0', border: 'none', cursor: 'pointer',
                                background: activeTab === tab.key ? 'var(--surface)' : 'transparent',
                                color: activeTab === tab.key ? 'var(--text)' : 'var(--text-muted)',
                                fontWeight: activeTab === tab.key ? 600 : 400,
                                fontSize: 13, fontFamily: 'Noto Sans, sans-serif',
                                transition: 'all 0.15s',
                                borderRight: i < arr.length - 1 ? '0.5px solid var(--border)' : 'none',
                            }}>
                                {lang === 'bm' ? tab.labelBM : tab.labelEN}
                            </button>
                        ))}
                    </div>

                    {/* ── TODAY TAB ── */}
                    {activeTab === 'today' && (
                        <>
                            <p style={{
                                fontSize: 11, color: 'var(--text-muted)',
                                letterSpacing: '1px', textTransform: 'uppercase',
                                marginBottom: 16, fontFamily: 'Noto Sans, sans-serif',
                            }}>
                                {lang === 'bm' ? 'HADITH HARI INI' : 'HADITH OF THE DAY'}
                            </p>
                            <HadithCard
                                hadith={todayHadith}
                                showBookmark={true}
                                fromSaved={false}
                                savedIds={savedIds}
                                lang={lang}
                                onToggle={toggleBookmark}
                                onRemove={removeSaved}
                            />
                        </>
                    )}

                    {/* ── SAVED TAB ── */}
                    {activeTab === 'saved' && (
                        <>
                            {loadingSaved ? (
                                <div style={{ padding: '40px 0', textAlign: 'center' }}>
                                    <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                                        {[0, 1, 2].map(i => (
                                            <span key={i} style={{
                                                width: 6, height: 6, borderRadius: '50%',
                                                background: 'var(--gold)', display: 'inline-block',
                                                animation: 'bounce 1.2s infinite',
                                                animationDelay: `${i * 0.2}s`,
                                            }} />
                                        ))}
                                    </div>
                                </div>
                            ) : savedHadith.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '60px 0' }}>
                                    <div style={{
                                        fontFamily: "'Noto Naskh Arabic', serif",
                                        fontSize: 48, color: 'var(--text-muted)',
                                        marginBottom: 16, opacity: 0.4,
                                    }}>
                                        ﷽
                                    </div>
                                    <p style={{
                                        fontFamily: "'Playfair Display', serif",
                                        fontSize: 20, color: 'var(--text)', marginBottom: 8,
                                    }}>
                                        {lang === 'bm' ? 'Tiada Hadith Tersimpan' : 'No Saved Hadith'}
                                    </p>
                                    <p style={{ color: 'var(--text-sub)', fontSize: 14, lineHeight: 1.6 }}>
                                        {lang === 'bm'
                                            ? 'Ketuk ikon penanda buku untuk menyimpan hadith.'
                                            : 'Tap the bookmark icon to save a hadith.'}
                                    </p>
                                </div>
                            ) : (
                                savedHadith.map(h => (
                                    <HadithCard
                                        key={h.id}
                                        hadith={h}
                                        showBookmark={true}
                                        fromSaved={true}
                                        savedIds={savedIds}
                                        lang={lang}
                                        onToggle={toggleBookmark}
                                        onRemove={removeSaved}
                                    />
                                ))
                            )}
                        </>
                    )}

                    {/* ── ALL TAB ── */}
                    {activeTab === 'all' && (
                        <>
                            <p style={{
                                fontSize: 11, color: 'var(--text-muted)',
                                letterSpacing: '1px', textTransform: 'uppercase',
                                marginBottom: 16, fontFamily: 'Noto Sans, sans-serif',
                            }}>
                                {HADITH_COLLECTION.length} {lang === 'bm' ? 'HADITH SAHIH' : 'AUTHENTIC HADITH'}
                            </p>
                            {HADITH_COLLECTION.map(h => (
                                <HadithCard
                                    key={h.id}
                                    hadith={h}
                                    showBookmark={true}
                                    fromSaved={false}
                                    savedIds={savedIds}
                                    lang={lang}
                                    onToggle={toggleBookmark}
                                    onRemove={removeSaved}
                                />
                            ))}
                        </>
                    )}

                </div>
            </div>
            <BottomNav />
        </>
    )
}
