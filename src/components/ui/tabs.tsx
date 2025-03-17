// components/ui/tabs.tsx
import { FC, ReactNode } from "react"

interface TabsProps {
  children: ReactNode
  defaultValue: string
  className?: string // Add className as optional
}

export const Tabs: FC<TabsProps> = ({ children, defaultValue, className }) => {
  return (
    <div className={`${className}`}>
      <div className="flex gap-6">{children}</div>
      <div className="mt-4">{children}</div>
    </div>
  )
}

interface TabsListProps {
  children: ReactNode
}

export const TabsList: FC<TabsListProps> = ({ children }) => {
  return <div className="flex gap-6">{children}</div>
}

interface TabsTriggerProps {
  value: string
  children: ReactNode
}

export const TabsTrigger: FC<TabsTriggerProps> = ({ value, children }) => {
  return (
    <button
      value={value}
      className="py-2 px-4 text-sm font-medium text-gray-500 hover:text-blue-600"
    >
      {children}
    </button>
  )
}

interface TabsContentProps {
  value: string
  children: ReactNode
  className?: string // Add className as optional
}

export const TabsContent: FC<TabsContentProps> = ({ value, children, className }) => {
  return <div className={`${className}`}>{children}</div>
}
