type InputProps = {
  label?: string
  icon?: string
  error?: string
} & React.InputHTMLAttributes<HTMLInputElement>

export default function Input({
  label,
  icon,
  error,
  className = '',
  id,
  ...props
}: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s/g, '-')

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label htmlFor={inputId} className="text-[12px] font-medium text-on-surface-variant uppercase tracking-wider">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[20px] text-on-surface-variant material-symbols-outlined">
            {icon}
          </span>
        )}
        <input
          id={inputId}
          className={`w-full py-2.5 px-4 bg-surface-container-low border rounded-md text-on-surface text-sm transition-colors duration-150 placeholder:text-on-surface-variant/60 focus:border-electric-blue/50 focus:shadow-[0_0_0_2px_rgba(0,123,255,0.15)] outline-none ${
            icon ? 'pl-10' : ''
          } ${error ? 'border-error' : 'border-border-low'}`}
          {...props}
        />
      </div>
      {error && <span className="text-[12px] text-error">{error}</span>}
    </div>
  )
}
