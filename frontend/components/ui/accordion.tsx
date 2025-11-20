"use client"

import * as React from "react"
import { ChevronDown } from "lucide-react"

interface AccordionProps {
  type?: "single" | "multiple"
  collapsible?: boolean
  children: React.ReactNode
  className?: string
}

interface AccordionItemProps {
  value: string
  children: React.ReactNode
  className?: string
}

interface AccordionTriggerProps {
  children: React.ReactNode
  className?: string
}

interface AccordionContentProps {
  children: React.ReactNode
  className?: string
}

const AccordionContext = React.createContext<{
  openItems: Set<string>
  toggleItem: (value: string) => void
}>({
  openItems: new Set(),
  toggleItem: () => {},
})

const AccordionItemContext = React.createContext<{ value: string }>({ value: "" })

const Accordion = React.forwardRef<HTMLDivElement, AccordionProps>(
  ({ type = "single", collapsible = false, children, className }, ref) => {
    const [openItems, setOpenItems] = React.useState<Set<string>>(new Set())

    const toggleItem = (value: string) => {
      setOpenItems((prev) => {
        const newSet = new Set(prev)
        if (newSet.has(value)) {
          newSet.delete(value)
        } else {
          if (type === "single") {
            newSet.clear()
          }
          newSet.add(value)
        }
        return newSet
      })
    }

    return (
      <AccordionContext.Provider value={{ openItems, toggleItem }}>
        <div ref={ref} className={className}>
          {children}
        </div>
      </AccordionContext.Provider>
    )
  }
)
Accordion.displayName = "Accordion"

const AccordionItem = React.forwardRef<HTMLDivElement, AccordionItemProps>(
  ({ value, children, className }, ref) => {
    return (
      <AccordionItemContext.Provider value={{ value }}>
        <div ref={ref} className={`border-b ${className || ""}`}>
          {children}
        </div>
      </AccordionItemContext.Provider>
    )
  }
)
AccordionItem.displayName = "AccordionItem"

const AccordionTrigger = React.forwardRef<HTMLButtonElement, AccordionTriggerProps>(
  ({ children, className }, ref) => {
    const { openItems, toggleItem } = React.useContext(AccordionContext)
    const { value } = React.useContext(AccordionItemContext)
    const isOpen = openItems.has(value)

    return (
      <button
        ref={ref}
        type="button"
        onClick={() => toggleItem(value)}
        className={`flex w-full items-center justify-between py-4 font-medium transition-all hover:underline ${className || ""}`}
      >
        {children}
        <ChevronDown
          className={`h-4 w-4 shrink-0 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
    )
  }
)
AccordionTrigger.displayName = "AccordionTrigger"

const AccordionContent = React.forwardRef<HTMLDivElement, AccordionContentProps>(
  ({ children, className }, ref) => {
    const { openItems } = React.useContext(AccordionContext)
    const { value } = React.useContext(AccordionItemContext)
    const isOpen = openItems.has(value)

    if (!isOpen) return null

    return (
      <div
        ref={ref}
        className={`overflow-hidden pb-4 pt-0 text-sm transition-all ${className || ""}`}
      >
        {children}
      </div>
    )
  }
)
AccordionContent.displayName = "AccordionContent"

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
