import * as React from "react"
import ReactDOM from "react-dom"
import { cn } from "../../lib/utils"

const DropdownMenuContext = React.createContext()

/**
 * DropdownMenu provides open state and the trigger node reference.
 * We render the menu content in a portal so it can float above tables and other containers.
 */
const DropdownMenu = ({ children }) => {
  const [open, setOpen] = React.useState(false)
  const [triggerNode, setTriggerNode] = React.useState(null)

  return (
    <DropdownMenuContext.Provider value={{ open, setOpen, triggerNode, setTriggerNode }}>
      <div className="inline-block">{children}</div>
    </DropdownMenuContext.Provider>
  )
}

const DropdownMenuTrigger = React.forwardRef(({ className, children, ...props }, ref) => {
  const { open, setOpen, setTriggerNode } = React.useContext(DropdownMenuContext)
  const localRef = React.useRef(null)
  React.useImperativeHandle(ref, () => localRef.current)

  React.useEffect(() => {
    setTriggerNode(localRef.current)
    return () => setTriggerNode(null)
  }, [setTriggerNode])

  return (
    <div
      ref={localRef}
      className={className}
      onClick={(e) => {
        e.stopPropagation()
        setOpen(!open)
      }}
      {...props}
    >
      {children}
    </div>
  )
})
DropdownMenuTrigger.displayName = "DropdownMenuTrigger"

/**
 * DropdownMenuContent is portaled to body and positioned using the trigger's bounding rect.
 * This prevents it from being clipped or aligned into table rows and allows it to float.
 */
const DropdownMenuContent = React.forwardRef(({ className, children, side = 'bottom', align = 'end', offset = 6, ...props }, ref) => {
  const { open, setOpen, triggerNode } = React.useContext(DropdownMenuContext)
  const contentRef = React.useRef(null)
  const [style, setStyle] = React.useState({ left: 0, top: 0, minWidth: undefined })

  React.useImperativeHandle(ref, () => contentRef.current)

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (contentRef.current && !contentRef.current.contains(event.target) && !triggerNode?.contains(event.target)) {
        setOpen(false)
      }
    }

    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open, setOpen, triggerNode])

  const updatePosition = React.useCallback(() => {
    if (!triggerNode || !contentRef.current) return
    const rect = triggerNode.getBoundingClientRect()
    const content = contentRef.current
    const computedMinWidth = Math.max(rect.width, 128)

    // Default: positioned below trigger, aligned to end (right)
    let left = rect.left + window.scrollX
    if (align === 'end') {
      left = rect.right - content.offsetWidth + window.scrollX
    } else if (align === 'end') {
      left = rect.left + (rect.width - content.offsetWidth) / 2 + window.scrollX
    }

    let top = rect.bottom + offset + window.scrollY
    if (side === 'top') {
      top = rect.top - content.offsetHeight - offset + window.scrollY
    }

    // Keep within viewport horizontally
    const viewportPadding = 8
    if (left + content.offsetWidth > window.scrollX + window.innerWidth - viewportPadding) {
      left = window.scrollX + window.innerWidth - content.offsetWidth - viewportPadding
    }
    if (left < window.scrollX + viewportPadding) left = window.scrollX + viewportPadding

    setStyle({ left, top, minWidth: computedMinWidth })
  }, [triggerNode, align, side, offset])

  React.useEffect(() => {
    if (!open) return
    updatePosition()
    window.addEventListener('resize', updatePosition)
    window.addEventListener('scroll', updatePosition, true)
    return () => {
      window.removeEventListener('resize', updatePosition)
      window.removeEventListener('scroll', updatePosition, true)
    }
  }, [open, updatePosition])

  if (!open) return null

  const content = (
    <div
      ref={contentRef}
      style={{ position: 'absolute', left: style.left, top: style.top, minWidth: style.minWidth }}
      className={cn(
        "z-50 overflow-hidden rounded-md border bg-white p-1 text-slate-950 shadow-md",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )

  return ReactDOM.createPortal(content, document.body)
})
DropdownMenuContent.displayName = "DropdownMenuContent"

const DropdownMenuItem = React.forwardRef(({ className, inset, onClick, ...props }, ref) => {
  const { setOpen } = React.useContext(DropdownMenuContext)

  const handleClick = (e) => {
    onClick?.(e)
    setOpen(false)
  }

  return (
    <div
      ref={ref}
      onClick={handleClick}
      className={cn(
        "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-slate-100 focus:bg-slate-100 focus:text-slate-900",
        inset && "pl-8",
        className
      )}
      {...props}
    />
  )
})
DropdownMenuItem.displayName = "DropdownMenuItem"

const DropdownMenuSeparator = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-slate-200", className)}
    {...props}
  />
))
DropdownMenuSeparator.displayName = "DropdownMenuSeparator"

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
}
