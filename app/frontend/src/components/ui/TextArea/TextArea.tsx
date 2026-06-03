type TextAreaProps = {
  label?: string
  error?: string
} & React.TextareaHTMLAttributes<HTMLTextAreaElement>

export default function TextArea({ label, error, className = '', id, ...props }: TextAreaProps) {
  const areaId = id || label?.toLowerCase().replace(/\s/g, '-')

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label htmlFor={areaId} className="text-[12px] font-medium text-on-surface-variant uppercase tracking-wider">
          {label}
        </label>
      )}
      <textarea
        id={areaId}
        className={`w-full min-h-[100px] py-3 px-4 bg-surface-container-low border rounded-md text-on-surface text-sm resize-y transition-colors duration-150 placeholder:text-on-surface-variant/60 focus:border-electric-blue/50 focus:shadow-[0_0_0_2px_rgba(0,123,255,0.15)] outline-none ${
          error ? 'border-error' : 'border-border-low'
        }`}
        {...props}
      />
      {error && <span className="text-[12px] text-error">{error}</span>}
    </div>
  )
}
