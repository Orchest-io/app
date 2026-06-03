import { useState } from 'react'

type Tab = {
  key: string
  label: string
  icon?: string
}

type TabsProps = {
  tabs: Tab[]
  defaultTab?: string
  onChange?: (key: string) => void
  className?: string
}

export default function Tabs({ tabs, defaultTab, onChange, className = '' }: TabsProps) {
  const [active, setActive] = useState(defaultTab || tabs[0]?.key)

  const handleClick = (key: string) => {
    setActive(key)
    onChange?.(key)
  }

  return (
    <div className={`flex gap-1 bg-surface-container-low rounded-md p-1 border border-border-low ${className}`}>
      {tabs.map((tab) => (
        <button
          key={tab.key}
          className={`py-2 px-4 rounded-sm text-[13px] font-medium flex items-center gap-1.5 transition-all duration-150 hover:text-on-surface cursor-pointer ${
            active === tab.key
              ? 'bg-surface-container-highest text-on-surface'
              : 'text-on-surface-variant'
          }`}
          onClick={() => handleClick(tab.key)}
        >
          {tab.icon && (
            <span className="material-symbols-outlined text-[16px]">
              {tab.icon}
            </span>
          )}
          {tab.label}
        </button>
      ))}
    </div>
  )
}
