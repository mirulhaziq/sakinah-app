import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { BookOpen, LayoutDashboard, LogOut, Sparkles } from 'lucide-react'
import styles from './Navbar.module.css'

export default function Navbar() {
    const { user, profile, signOut } = useAuth()
    const location = useLocation()
    const navigate = useNavigate()

    async function handleSignOut() {
        await signOut()
        navigate('/auth')
    }

    const initials = profile?.display_name
        ? profile.display_name.slice(0, 2).toUpperCase()
        : user?.email?.slice(0, 2).toUpperCase() || 'JE'

    return (
        <nav className={styles.nav}>
            <div className={styles.inner}>
                {/* Logo */}
                <Link to="/dashboard" className={styles.logo}>
                    <div className={styles.logoIcon}>
                        <Sparkles size={16} />
                    </div>
                    <span className={styles.logoText}>Journal</span>
                </Link>

                {/* Nav links */}
                <div className={styles.links}>
                    <Link
                        to="/dashboard"
                        className={`${styles.link} ${location.pathname === '/dashboard' ? styles.active : ''}`}
                    >
                        <LayoutDashboard size={16} />
                        <span>Dashboard</span>
                    </Link>
                    <Link
                        to="/chat"
                        className={`${styles.link} ${location.pathname === '/chat' ? styles.active : ''}`}
                    >
                        <BookOpen size={16} />
                        <span>Journal</span>
                    </Link>
                </div>

                {/* User area */}
                <div className={styles.userArea}>
                    <div className={styles.avatar}>{initials}</div>
                    <button className={styles.signOut} onClick={handleSignOut} title="Sign out">
                        <LogOut size={16} />
                    </button>
                </div>
            </div>
        </nav>
    )
}
