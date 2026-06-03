type ToggleProps = {
  label?: string
} & React.InputHTMLAttributes<HTMLInputElement>

export default function Toggle({ label, className = '', id, ...props }: ToggleProps) {
  const toggleId = id || label?.toLowerCase().replace(/\s/g, '-')

  return (
    <label htmlFor={toggleId} className={`inline-flex items-center gap-2.5 cursor-pointer select-none ${className}`}>
      <input type="checkbox" id={toggleId} className="sr-only peer" {...props} />
      <span className="w-11 h-6 rounded-full bg-surface-container-highest relative transition-colors duration-200 shrink-0 peer-checked:bg-electric-blue">
        <span className="w-[18px] h-[18px] rounded-full bg-on-surface-variant absolute top-[3px] left-[3px] transition-all duration-200 peer-checked:left-[23px] peer-checked:bg-white" />
      </span>
      {label && <span className="text-sm text-on-surface">{label}</span>}
    </label>
  )
}
