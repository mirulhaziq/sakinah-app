import styles from './StatCard.module.css'

export default function StatCard({ icon, label, value, sub, gradient }) {
    return (
        <div className={`glass-card ${styles.card}`}>
            <div className={styles.iconWrap} style={{ background: gradient || 'linear-gradient(135deg, #a855f7, #6366f1)' }}>
                {icon}
            </div>
            <div className={styles.body}>
                <p className={styles.label}>{label}</p>
                <p className={styles.value}>{value ?? '—'}</p>
                {sub && <p className={styles.sub}>{sub}</p>}
            </div>
        </div>
    )
}
