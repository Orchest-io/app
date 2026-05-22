type ProgressBarProps = {
  value: number
  max?: number
  color?: 'blue' | 'purple'
  size?: 'sm' | 'md'
  glow?: boolean
  className?: string
}

export default function ProgressBar({
  value,
  max = 100,
  color = 'blue',
  size = 'sm',
  glow = false,
  className = '',
}: ProgressBarProps) {
  const percent = Math.min((value / max) * 100, 100)

  const sizeClasses = {
    sm: 'h-[6px]',
    md: 'h-[10px]'
  }

  const colorClasses = {
    blue: 'bg-electric-blue',
    purple: 'bg-peri-purple'
  }

  const glowClasses = glow
    ? color === 'blue'
      ? 'shadow-[0_0_8px_rgba(0,123,255,0.5)]'
      : 'shadow-[0_0_8px_rgba(204,204,255,0.3)]'
    : ''

  return (
    <div className={`w-full bg-surface-container rounded-full overflow-hidden ${sizeClasses[size]} ${className}`}>
      <div
        className={`h-full rounded-full transition-[width] duration-300 ${colorClasses[color]} ${glowClasses}`}
        style={{ width: `${percent}%` }}
      />
    </div>
  )
}
