type ButtonProps = {
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  icon?: string
  children: React.ReactNode
} & React.ButtonHTMLAttributes<HTMLButtonElement>

export default function Button({
  variant = 'primary',
  size = 'md',
  icon,
  children,
  className = '',
  ...props
}: ButtonProps) {
  const baseClasses = 'inline-flex items-center justify-center gap-2 font-heading font-semibold rounded-md transition-all duration-200 ease-out whitespace-nowrap active:scale-95 cursor-pointer'
  
  const variants = {
    primary: 'bg-electric-blue text-white hover:shadow-[0_0_20px_rgba(0,123,255,0.3)]',
    secondary: 'bg-surface-glass text-on-surface border border-border-low hover:bg-surface-container-highest',
    ghost: 'bg-transparent text-on-surface-variant hover:text-on-surface hover:bg-surface-glass'
  }

  const sizes = {
    sm: 'py-1.5 px-3.5 text-xs',
    md: 'py-2.5 px-5 text-sm',
    lg: 'py-3 px-7 text-base rounded-lg'
  }

  const iconSizes = {
    sm: 'text-[16px]',
    md: 'text-[18px]',
    lg: 'text-[18px]'
  }

  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {icon && (
        <span className={`material-symbols-outlined ${iconSizes[size]}`}>
          {icon}
        </span>
      )}
      {children}
    </button>
  )
}
