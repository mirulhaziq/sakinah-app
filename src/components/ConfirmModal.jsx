// Sakinah سكينة — Confirm Modal Component

import { useEffect } from 'react'

export default function ConfirmModal({ message, confirmLabel, cancelLabel, onConfirm, onCancel, danger = false }) {
    // Close on Escape key
    useEffect(() => {
        function onKey(e) {
            if (e.key === 'Escape') onCancel()
        }
        document.addEventListener('keydown', onKey)
        return () => document.removeEventListener('keydown', onKey)
    }, [onCancel])

    return (
        <div
            onClick={onCancel}
            style={{
                position: 'fixed', inset: 0, zIndex: 9999,
                background: 'rgba(0,0,0,0.6)',
                backdropFilter: 'blur(6px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '0 20px',
                animation: 'sakinahFadeIn 0.2s ease',
            }}
        >
            <div
                onClick={e => e.stopPropagation()}
                style={{
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: 20,
                    padding: '28px 24px',
                    maxWidth: 360,
                    width: '100%',
                    boxShadow: 'var(--shadow-lg)',
                    animation: 'sakinahSlideUp 0.25s ease',
                }}
            >
                <p style={{
                    color: 'var(--text-primary)',
                    fontSize: 15,
                    lineHeight: 1.6,
                    marginBottom: 24,
                    textAlign: 'center',
                }}>
                    {message}
                </p>
                <div style={{ display: 'flex', gap: 10 }}>
                    <button
                        onClick={onCancel}
                        style={{
                            flex: 1, padding: '12px 0',
                            borderRadius: 10, border: '1px solid var(--glass-border)',
                            background: 'transparent', color: 'var(--text-secondary)',
                            fontSize: 14, fontWeight: 500, cursor: 'pointer',
                            transition: 'all 0.2s ease',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-card)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                        {cancelLabel || 'Batal'}
                    </button>
                    <button
                        onClick={onConfirm}
                        style={{
                            flex: 1, padding: '12px 0',
                            borderRadius: 10, border: 'none',
                            background: danger ? '#ef4444' : 'var(--accent-gradient)',
                            color: 'white', fontSize: 14, fontWeight: 600,
                            cursor: 'pointer', transition: 'all 0.2s ease',
                        }}
                        onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                        onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                    >
                        {confirmLabel || 'Sahkan'}
                    </button>
                </div>
            </div>
        </div>
    )
}
