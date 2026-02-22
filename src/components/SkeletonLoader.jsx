// Sakinah سكينة — Skeleton Loader Component
// Animated shimmer blocks for loading states

export default function SkeletonLoader({ lines = 3, height = 18, width = '100%', style = {} }) {
    const shimmerStyle = {
        background: 'linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.04) 75%)',
        backgroundSize: '200% 100%',
        animation: 'sakinahShimmer 1.5s infinite',
        borderRadius: 8,
        ...style,
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {Array.from({ length: lines }).map((_, i) => (
                <div
                    key={i}
                    style={{
                        ...shimmerStyle,
                        height,
                        width: i === lines - 1 && lines > 1 ? '65%' : width,
                    }}
                />
            ))}
        </div>
    )
}

// Card-shaped skeleton
export function SkeletonCard({ height = 100, style = {} }) {
    return (
        <div style={{
            background: 'linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 75%)',
            backgroundSize: '200% 100%',
            animation: 'sakinahShimmer 1.5s infinite',
            borderRadius: 16,
            height,
            ...style,
        }} />
    )
}
