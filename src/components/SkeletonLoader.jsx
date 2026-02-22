// Sakinah — Skeleton Loader (Stoic style)

export default function SkeletonLoader({ lines = 3, height = 16, width = '100%' }) {
    const shimmer = {
        background: 'linear-gradient(90deg, var(--surface) 25%, var(--border) 50%, var(--surface) 75%)',
        backgroundSize: '400px 100%',
        animation: 'shimmer 1.4s infinite',
        borderRadius: 4,
    }
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {Array.from({ length: lines }).map((_, i) => (
                <div key={i} style={{
                    ...shimmer, height,
                    width: i === lines - 1 && lines > 1 ? '60%' : width,
                }} />
            ))}
        </div>
    )
}

export function SkeletonCard({ height = 80 }) {
    return (
        <div style={{
            background: 'linear-gradient(90deg, var(--surface) 25%, var(--border) 50%, var(--surface) 75%)',
            backgroundSize: '400px 100%',
            animation: 'shimmer 1.4s infinite',
            borderRadius: 12, height,
        }} />
    )
}
