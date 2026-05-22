type SelectProps = {
  label?: string
  options: { value: string; label: string }[]
  error?: string
} & React.SelectHTMLAttributes<HTMLSelectElement>

export default function Select({
  label,
  options,
  error,
  className = '',
  id,
  ...props
}: SelectProps) {
  const selectId = id || label?.toLowerCase().replace(/\s/g, '-')

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label htmlFor={selectId} className="text-[12px] font-medium text-on-surface-variant uppercase tracking-wider">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          id={selectId}
          className={`w-full py-2.5 pl-4 pr-10 bg-surface-container-low border rounded-md text-on-surface text-sm appearance-none cursor-pointer transition-colors duration-150 focus:border-electric-blue/50 focus:shadow-[0_0_0_2px_rgba(0,123,255,0.15)] outline-none ${
            error ? 'border-error' : 'border-border-low'
          }`}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-surface-container text-on-surface">
              {opt.label}
            </option>
          ))}
        </select>
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[20px] text-on-surface-variant pointer-events-none material-symbols-outlined">
          expand_more
        </span>
      </div>
      {error && <span className="text-[12px] text-error">{error}</span>}
    </div>
  )
}
