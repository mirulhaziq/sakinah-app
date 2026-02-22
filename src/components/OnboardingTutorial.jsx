// Sakinah — Onboarding (first-time only, Stoic style)

import { useState } from 'react'
import { useLanguage } from '../context/LanguageContext'

// Arabic characters as step icons — clean and human
const STEP_ICONS = ['س', 'ص', 'ك', 'ي', 'ن']

const STEPS = [
    { titleKey: 'onboardingStep1Title', bodyKey: 'onboardingStep1Body' },
    { titleKey: 'onboardingStep2Title', bodyKey: 'onboardingStep2Body' },
    { titleKey: 'onboardingStep3Title', bodyKey: 'onboardingStep3Body' },
    { titleKey: 'onboardingStep4Title', bodyKey: 'onboardingStep4Body' },
    { titleKey: 'onboardingStep5Title', bodyKey: 'onboardingStep5Body' },
]

export default function OnboardingTutorial({ onComplete }) {
    const { t } = useLanguage()
    const [step, setStep] = useState(0)
    const isLast = step === STEPS.length - 1

    function finish() {
        localStorage.setItem('sakinah_onboarded', 'true')
        onComplete()
    }

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 10000,
            background: 'var(--bg)',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            padding: '0 32px',
            animation: 'fadeIn 0.3s ease',
        }}>
            {/* Progress lines */}
            <div style={{ display: 'flex', gap: 6, marginBottom: 56, width: '100%', maxWidth: 280 }}>
                {STEPS.map((_, i) => (
                    <div key={i} style={{
                        flex: 1, height: 2, borderRadius: 1,
                        background: i <= step ? 'var(--gold)' : 'var(--border)',
                        transition: 'background 0.3s ease',
                    }} />
                ))}
            </div>

            {/* Arabic character icon */}
            <div style={{
                fontFamily: "'Noto Naskh Arabic', serif",
                fontSize: 64, color: 'var(--gold)',
                marginBottom: 32, lineHeight: 1,
                opacity: 0.9,
            }}>
                {STEP_ICONS[step]}
            </div>

            {/* Title */}
            <h2 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 24, fontWeight: 600,
                color: 'var(--text)', textAlign: 'center',
                marginBottom: 16, lineHeight: 1.3,
            }}>
                {t(STEPS[step].titleKey)}
            </h2>

            {/* Body */}
            <p style={{
                color: 'var(--text-sub)', fontSize: 15,
                lineHeight: 1.8, textAlign: 'center',
                maxWidth: 320, marginBottom: 56,
            }}>
                {t(STEPS[step].bodyKey)}
            </p>

            {/* Next / Begin button */}
            <button
                onClick={() => isLast ? finish() : setStep(s => s + 1)}
                style={{
                    width: '100%', maxWidth: 320,
                    padding: '16px 0', borderRadius: 12,
                    background: 'var(--gold)', border: 'none',
                    color: '#1A160B', fontWeight: 600, fontSize: 15,
                    fontFamily: 'Noto Sans, sans-serif',
                    cursor: 'pointer', marginBottom: 16,
                    transition: 'opacity 0.15s ease',
                }}
                onTouchStart={e => e.currentTarget.style.opacity = '0.8'}
                onTouchEnd={e => e.currentTarget.style.opacity = '1'}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
                {isLast ? t('onboardingBegin') : t('onboardingNext')}
            </button>

            {/* Back / Skip row */}
            <div style={{ display: 'flex', gap: 32, justifyContent: 'center' }}>
                {step > 0 && (
                    <button onClick={() => setStep(s => s - 1)} style={{
                        background: 'none', border: 'none',
                        color: 'var(--text-sub)', fontSize: 14, cursor: 'pointer',
                        fontFamily: 'Noto Sans, sans-serif', padding: '8px 0',
                    }}>
                        {t('onboardingPrev')}
                    </button>
                )}
                {!isLast && (
                    <button onClick={finish} style={{
                        background: 'none', border: 'none',
                        color: 'var(--text-muted)', fontSize: 14, cursor: 'pointer',
                        fontFamily: 'Noto Sans, sans-serif', padding: '8px 0',
                    }}>
                        {t('onboardingSkip')}
                    </button>
                )}
            </div>
        </div>
    )
}
