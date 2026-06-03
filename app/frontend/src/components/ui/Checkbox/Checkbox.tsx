type CheckboxProps = {
  label?: string
} & React.InputHTMLAttributes<HTMLInputElement>

export default function Checkbox({ label, className = '', id, ...props }: CheckboxProps) {
  const checkId = id || label?.toLowerCase().replace(/\s/g, '-')

  return (
    <label htmlFor={checkId} className={`inline-flex items-center gap-2.5 cursor-pointer select-none ${className}`}>
      <input type="checkbox" id={checkId} className="sr-only peer" {...props} />
      <span className="w-5 h-5 rounded-[6px] border-[1.5px] border-outline-variant flex items-center justify-center transition-all duration-150 shrink-0 peer-checked:bg-electric-blue peer-checked:border-electric-blue">
        <span className="material-symbols-outlined text-[14px] opacity-0 text-white transition-opacity duration-150 peer-checked:opacity-100">
          check
        </span>
      </span>
      {label && <span className="text-sm text-on-surface">{label}</span>}
    </label>
  )
}
