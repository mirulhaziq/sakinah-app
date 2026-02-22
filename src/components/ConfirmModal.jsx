// Sakinah — Confirm Modal (Stoic style)

import { useEffect } from 'react'

export default function ConfirmModal({ message, confirmLabel, cancelLabel, onConfirm, onCancel, danger = false }) {
    useEffect(() => {
        const onKey = e => { if (e.key === 'Escape') onCancel() }
        document.addEventListener('keydown', onKey)
        return () => document.removeEventListener('keydown', onKey)
    }, [onCancel])

    return (
        <div onClick={onCancel} style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
            animation: 'fadeIn 0.2s ease',
            paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        }}>
            <div onClick={e => e.stopPropagation()} style={{
                background: 'var(--card)', borderRadius: '16px 16px 0 0',
                padding: '24px 24px 32px',
                width: '100%', maxWidth: 480,
                animation: 'slideUpSheet 0.25s ease',
            }}>
                {/* Handle */}
                <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--border)', margin: '0 auto 20px' }} />

                <p style={{
                    color: 'var(--text)', fontSize: 15, lineHeight: 1.65,
                    textAlign: 'center', marginBottom: 24,
                    fontFamily: 'Noto Sans, sans-serif',
                }}>
                    {message}
                </p>

                <div style={{ display: 'flex', gap: 10 }}>
                    <button onClick={onCancel} style={{
                        flex: 1, padding: '14px 0', borderRadius: 10,
                        border: '0.5px solid var(--border)',
                        background: 'transparent', color: 'var(--text-sub)',
                        fontSize: 15, cursor: 'pointer',
                        fontFamily: 'Noto Sans, sans-serif',
                    }}>
                        {cancelLabel || 'Batal'}
                    </button>
                    <button onClick={onConfirm} style={{
                        flex: 1, padding: '14px 0', borderRadius: 10, border: 'none',
                        background: danger ? '#ef4444' : 'var(--gold)',
                        color: danger ? 'white' : '#1A160B',
                        fontSize: 15, fontWeight: 600, cursor: 'pointer',
                        fontFamily: 'Noto Sans, sans-serif',
                    }}>
                        {confirmLabel || 'Sahkan'}
                    </button>
                </div>
            </div>
        </div>
    )
}
