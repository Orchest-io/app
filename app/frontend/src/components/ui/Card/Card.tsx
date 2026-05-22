type CardProps = {
  variant?: 'glass' | 'solid' | 'outlined'
  rounded?: 'md' | 'lg' | 'xl'
  padding?: 'sm' | 'md' | 'lg'
  hoverable?: boolean
  children: React.ReactNode
  className?: string
} & React.HTMLAttributes<HTMLDivElement>

export default function Card({
  variant = 'glass',
  rounded = 'xl',
  padding = 'md',
  hoverable = false,
  children,
  className = '',
  ...props
}: CardProps) {
  const baseClasses = 'border border-border-low'
  
  const variants = {
    glass: 'bg-surface-glass backdrop-blur-[20px]',
    solid: 'bg-surface-container-lowest',
    outlined: 'bg-transparent'
  }

  const borderRadii = {
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl'
  }

  const paddings = {
    sm: 'p-3',
    md: 'p-6',
    lg: 'p-8'
  }

  const hoverClasses = hoverable
    ? 'cursor-pointer transition-colors duration-200 hover:bg-surface-container-low'
    : ''

  return (
    <div
      className={`${baseClasses} ${variants[variant]} ${borderRadii[rounded]} ${paddings[padding]} ${hoverClasses} ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
