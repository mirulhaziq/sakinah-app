import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { Sparkles, Eye, EyeOff } from 'lucide-react'
import styles from './AuthPage.module.css'

const STOIC_QUOTES = [
    { quote: "You have power over your mind, not outside events. Realize this, and you will find strength.", author: "Marcus Aurelius" },
    { quote: "Waste no more time arguing about what a good man should be. Be one.", author: "Marcus Aurelius" },
    { quote: "The obstacle is the way.", author: "Ryan Holiday" },
    { quote: "He who fears death will never do anything worthy of a man who is alive.", author: "Seneca" },
    { quote: "If it is not right, do not do it; if it is not true, do not say it.", author: "Marcus Aurelius" },
]

const randomQuote = STOIC_QUOTES[Math.floor(Math.random() * STOIC_QUOTES.length)]

export default function AuthPage() {
    const [mode, setMode] = useState('login') // 'login' | 'signup'
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPass, setShowPass] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [success, setSuccess] = useState(null)
    const { signIn, signUp } = useAuth()

    async function handleSubmit(e) {
        e.preventDefault()
        setError(null)
        setSuccess(null)

        if (!email.trim() || !password.trim()) {
            setError('Please fill in all fields.')
            return
        }
        if (password.length < 6) {
            setError('Password must be at least 6 characters.')
            return
        }

        setLoading(true)
        try {
            if (mode === 'signup') {
                await signUp(email, password)
                setSuccess('Account created! Check your email to confirm, then log in.')
                setMode('login')
            } else {
                await signIn(email, password)
                // App.jsx will redirect automatically via auth state change
            }
        } catch (err) {
            setError(err.message || 'Something went wrong. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className={styles.page}>
            {/* Background orbs */}
            <div className={styles.orb1} />
            <div className={styles.orb2} />

            <div className={styles.container}>
                {/* Left panel: quote */}
                <div className={styles.quotePanel}>
                    <div className={styles.logoArea}>
                        <div className={styles.logoIcon}><Sparkles size={20} /></div>
                        <span className={styles.logoText}>Journal</span>
                    </div>
                    <div className={styles.quoteBlock}>
                        <p className={styles.quote}>"{randomQuote.quote}"</p>
                        <p className={styles.quoteAuthor}>— {randomQuote.author}</p>
                    </div>
                    <p className={styles.tagline}>Your AI-powered Stoic journal.<br />Write, reflect, and grow — every day.</p>
                </div>

                {/* Right panel: form */}
                <div className={`glass-card ${styles.formCard}`}>
                    <h1 className={styles.title}>
                        {mode === 'login' ? 'Welcome back' : 'Start your journey'}
                    </h1>
                    <p className={styles.subtitle}>
                        {mode === 'login'
                            ? 'Your journal remembers everything.'
                            : 'Begin your Stoic reflection practice.'}
                    </p>

                    {error && (
                        <div className={styles.errorBox}>
                            <span>⚠️</span> {error}
                        </div>
                    )}
                    {success && (
                        <div className={styles.successBox}>
                            <span>✅</span> {success}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className={styles.form}>
                        <div className={styles.field}>
                            <label className={styles.label}>Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                autoComplete="email"
                                disabled={loading}
                            />
                        </div>

                        <div className={styles.field}>
                            <label className={styles.label}>Password</label>
                            <div className={styles.passWrap}>
                                <input
                                    type={showPass ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                                    disabled={loading}
                                />
                                <button
                                    type="button"
                                    className={styles.eyeBtn}
                                    onClick={() => setShowPass(!showPass)}
                                    tabIndex={-1}
                                >
                                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        <button type="submit" className={`btn-primary ${styles.submitBtn}`} disabled={loading}>
                            {loading ? (
                                <span className={styles.loadingDots}>
                                    <span /><span /><span />
                                </span>
                            ) : mode === 'login' ? 'Sign In' : 'Create Account'}
                        </button>
                    </form>

                    <p className={styles.toggle}>
                        {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
                        <button
                            className={styles.toggleBtn}
                            onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(null); setSuccess(null); }}
                        >
                            {mode === 'login' ? 'Sign Up' : 'Sign In'}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    )
}
