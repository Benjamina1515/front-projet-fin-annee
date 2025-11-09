import * as React from "react"
import ReactDOM from "react-dom"
import { cn } from "../../lib/utils"

const VIEWPORT_PADDING = 8

const ContextMenuContext = React.createContext(null)

const mergeRefs = (...refs) => (node) => {
  refs.forEach((ref) => {
    if (!ref) return
    if (typeof ref === "function") {
      ref(node)
    } else {
      ref.current = node
    }
  })
}

const ContextMenu = ({ children }) => {
  const [open, setOpen] = React.useState(false)
  const [position, setPosition] = React.useState({ x: 0, y: 0 })
  const [triggerNode, setTriggerNode] = React.useState(null)

  const value = React.useMemo(
    () => ({ open, setOpen, position, setPosition, triggerNode, setTriggerNode }),
    [open, position, triggerNode]
  )

  return <ContextMenuContext.Provider value={value}>{children}</ContextMenuContext.Provider>
}

const ContextMenuTrigger = React.forwardRef(
  (
    {
      asChild = false,
      disabled = false,
      className,
      children,
      onContextMenu,
      ...props
    },
    ref
  ) => {
    const { setOpen, setPosition, setTriggerNode } = React.useContext(ContextMenuContext)
    const localRef = React.useRef(null)

    React.useEffect(() => {
      if (disabled) return
      setTriggerNode(localRef.current)
      return () => setTriggerNode(null)
    }, [setTriggerNode, disabled])

    const handleContextMenu = (event) => {
      if (disabled) return

      onContextMenu?.(event)
      event.preventDefault()
      event.stopPropagation()
      setPosition({ x: event.clientX, y: event.clientY })
      setOpen(true)
    }

    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children, {
        ref: mergeRefs(children.ref, ref, localRef),
        onContextMenu: (event) => {
          children.props?.onContextMenu?.(event)
          handleContextMenu(event)
        },
        ...props,
      })
    }

    return (
      <div
        ref={mergeRefs(ref, localRef)}
        className={className}
        onContextMenu={handleContextMenu}
        {...props}
      >
        {children}
      </div>
    )
  }
)
ContextMenuTrigger.displayName = "ContextMenuTrigger"

const ContextMenuContent = React.forwardRef(({ className, children, ...props }, ref) => {
  const { open, setOpen, position } = React.useContext(ContextMenuContext)
  const contentRef = React.useRef(null)
  const [style, setStyle] = React.useState({ left: 0, top: 0 })

  React.useImperativeHandle(ref, () => contentRef.current)

  React.useLayoutEffect(() => {
    if (!open || !contentRef.current) return

    const { offsetWidth, offsetHeight } = contentRef.current
    let left = position.x + window.scrollX
    let top = position.y + window.scrollY

    const maxLeft = window.scrollX + window.innerWidth - offsetWidth - VIEWPORT_PADDING
    const maxTop = window.scrollY + window.innerHeight - offsetHeight - VIEWPORT_PADDING

    left = Math.min(left, maxLeft)
    top = Math.min(top, maxTop)
    left = Math.max(left, window.scrollX + VIEWPORT_PADDING)
    top = Math.max(top, window.scrollY + VIEWPORT_PADDING)

    setStyle({ left, top })
  }, [open, position])

  React.useEffect(() => {
    if (!open) return

    const handlePointerDown = (event) => {
      if (!contentRef.current) return

      if (!contentRef.current.contains(event.target)) {
        setOpen(false)
      }
    }

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setOpen(false)
      }
    }

    document.addEventListener("mousedown", handlePointerDown)
    document.addEventListener("contextmenu", handlePointerDown)
    document.addEventListener("keydown", handleKeyDown)

    return () => {
      document.removeEventListener("mousedown", handlePointerDown)
      document.removeEventListener("contextmenu", handlePointerDown)
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [open, setOpen])

  if (!open) return null

  const content = (
    <div
      ref={contentRef}
      style={{ position: "absolute", left: style.left, top: style.top }}
      className={cn(
  "z-50 min-w-40 overflow-hidden rounded-md border bg-white p-1 text-slate-950 shadow-lg",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )

  return ReactDOM.createPortal(content, document.body)
})
ContextMenuContent.displayName = "ContextMenuContent"

const ContextMenuItem = React.forwardRef(
  ({ className, inset, onSelect, onClick, children, ...props }, ref) => {
    const { setOpen } = React.useContext(ContextMenuContext)

    const handleSelect = (event) => {
      onSelect?.(event)
      onClick?.(event)
      setOpen(false)
    }

    return (
      <div
        ref={ref}
        role="menuitem"
        tabIndex={-1}
        onClick={handleSelect}
        className={cn(
          "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-slate-100 focus:bg-slate-100 focus:text-slate-900",
          inset && "pl-8",
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)
ContextMenuItem.displayName = "ContextMenuItem"

const ContextMenuSeparator = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-slate-200", className)}
    {...props}
  />
))
ContextMenuSeparator.displayName = "ContextMenuSeparator"

export {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
}
