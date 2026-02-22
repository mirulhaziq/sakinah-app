import styles from './LoadingSpinner.module.css'

export default function LoadingSpinner({ fullscreen = false, size = 40 }) {
    const spinner = (
        <div className={styles.wrapper} style={{ width: size, height: size }}>
            <div className={styles.ring} style={{ width: size, height: size }} />
            <div className={styles.ring2} style={{ width: size * 0.7, height: size * 0.7 }} />
        </div>
    )

    if (fullscreen) {
        return (
            <div className={styles.fullscreen}>
                {spinner}
                <p className={styles.text}>Loading your journal…</p>
            </div>
        )
    }

    return spinner
}
