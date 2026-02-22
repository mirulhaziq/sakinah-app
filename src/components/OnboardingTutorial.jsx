// Sakinah سكينة — Onboarding Tutorial Component

import { useState } from 'react'
import { useLanguage } from '../context/LanguageContext'

const STEPS = [
    { titleKey: 'onboardingStep1Title', bodyKey: 'onboardingStep1Body', emoji: '🕌' },
    { titleKey: 'onboardingStep2Title', bodyKey: 'onboardingStep2Body', emoji: '🌙' },
    { titleKey: 'onboardingStep3Title', bodyKey: 'onboardingStep3Body', emoji: '📔' },
    { titleKey: 'onboardingStep4Title', bodyKey: 'onboardingStep4Body', emoji: '🤝' },
    { titleKey: 'onboardingStep5Title', bodyKey: 'onboardingStep5Body', emoji: '📊' },
]

export default function OnboardingTutorial({ onComplete }) {
    const { t } = useLanguage()
    const [step, setStep] = useState(0)
    const current = STEPS[step]
    const isLast = step === STEPS.length - 1

    function handleNext() {
        if (isLast) {
            localStorage.setItem('sakinah_onboarded', 'true')
            onComplete()
        } else {
            setStep(s => s + 1)
        }
    }

    function handleSkip() {
        localStorage.setItem('sakinah_onboarded', 'true')
        onComplete()
    }

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 10000,
            background: 'rgba(0,0,0,0.8)',
            backdropFilter: 'blur(12px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '0 20px',
            animation: 'sakinahFadeIn 0.3s ease',
        }}>
            <div style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--glass-border)',
                borderRadius: 24,
                padding: '36px 28px',
                maxWidth: 420, width: '100%',
                boxShadow: 'var(--shadow-lg)',
                animation: 'sakinahSlideUp 0.3s ease',
                textAlign: 'center',
            }}>
                {/* Progress dots */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 28 }}>
                    {STEPS.map((_, i) => (
                        <div key={i} style={{
                            width: i === step ? 22 : 8, height: 8,
                            borderRadius: 4,
                            background: i === step ? 'var(--accent)' : 'var(--glass-border)',
                            transition: 'all 0.3s ease',
                        }} />
                    ))}
                </div>

                {/* Emoji */}
                <div style={{ fontSize: 52, marginBottom: 16 }}>{current.emoji}</div>

                {/* Title */}
                <h2 style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: 22, fontWeight: 700,
                    color: 'var(--text-primary)',
                    marginBottom: 14, lineHeight: 1.3,
                }}>
                    {t(current.titleKey)}
                </h2>

                {/* Body */}
                <p style={{
                    color: 'var(--text-secondary)',
                    fontSize: 15, lineHeight: 1.7,
                    marginBottom: 32,
                }}>
                    {t(current.bodyKey)}
                </p>

                {/* Buttons */}
                <div style={{ display: 'flex', gap: 10, flexDirection: 'column' }}>
                    <button
                        onClick={handleNext}
                        style={{
                            background: 'var(--accent-gradient)',
                            color: 'white', fontWeight: 700,
                            fontSize: 16, padding: '14px 0',
                            borderRadius: 12, border: 'none',
                            cursor: 'pointer', transition: 'opacity 0.2s',
                        }}
                        onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
                        onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                    >
                        {isLast ? t('onboardingBegin') : t('onboardingNext')}
                    </button>

                    {!isLast && (
                        <div style={{ display: 'flex', gap: 10 }}>
                            {step > 0 && (
                                <button
                                    onClick={() => setStep(s => s - 1)}
                                    style={{
                                        flex: 1, padding: '10px 0',
                                        borderRadius: 10, border: '1px solid var(--glass-border)',
                                        background: 'transparent', color: 'var(--text-secondary)',
                                        fontSize: 14, cursor: 'pointer',
                                    }}
                                >
                                    {t('onboardingPrev')}
                                </button>
                            )}
                            <button
                                onClick={handleSkip}
                                style={{
                                    flex: 1, padding: '10px 0',
                                    borderRadius: 10, border: 'none',
                                    background: 'transparent', color: 'var(--text-muted)',
                                    fontSize: 14, cursor: 'pointer',
                                }}
                            >
                                {t('onboardingSkip')}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
