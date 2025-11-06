import * as React from "react"
import { X } from "lucide-react"
import { cn } from "../../lib/utils"

const DialogContext = React.createContext()

const Dialog = ({ open, onOpenChange, children }) => {
  return (
    <DialogContext.Provider value={{ open, onOpenChange }}>
      {children}
    </DialogContext.Provider>
  )
}

const DialogTrigger = React.forwardRef(({ className, children, asChild, ...props }, ref) => {
  const { onOpenChange } = React.useContext(DialogContext)
  
  return (
    <div
      ref={ref}
      className={className}
      onClick={() => onOpenChange?.(true)}
      {...props}
    >
      {children}
    </div>
  )
})
DialogTrigger.displayName = "DialogTrigger"

const DialogOverlay = React.forwardRef(({ className, ...props }, ref) => {
  const { open, onOpenChange } = React.useContext(DialogContext)
  
  if (!open) return null
  
  return (
    <div
      ref={ref}
      className={cn(
        "fixed inset-0 z-[60] bg-black/80",
        className
      )}
      onClick={() => onOpenChange?.(false)}
      {...props}
    />
  )
})
DialogOverlay.displayName = "DialogOverlay"

const DialogContent = React.forwardRef(({ className, children, ...props }, ref) => {
  const { open, onOpenChange } = React.useContext(DialogContext)
  
  if (!open) return null
  
  return (
    <>
      <DialogOverlay />
      <div
        ref={ref}
        className={cn(
          "fixed left-[50%] top-[50%] z-[60] grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-white p-6 shadow-lg duration-200 rounded-lg",
          className
        )}
        onClick={(e) => e.stopPropagation()}
        {...props}
      >
        {children}
        <button
          onClick={() => onOpenChange?.(false)}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-white transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>
      </div>
    </>
  )
})
DialogContent.displayName = "DialogContent"

const DialogHeader = ({ className, ...props }) => (
  <div
    className={cn(
      "flex flex-col space-y-1.5 text-center sm:text-left",
      className
    )}
    {...props}
  />
)
DialogHeader.displayName = "DialogHeader"

const DialogFooter = ({ className, ...props }) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    )}
    {...props}
  />
)
DialogFooter.displayName = "DialogFooter"

const DialogTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h2
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
DialogTitle.displayName = "DialogTitle"

const DialogDescription = React.forwardRef(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-slate-500", className)}
    {...props}
  />
))
DialogDescription.displayName = "DialogDescription"

export {
  Dialog,
  DialogTrigger,
  DialogOverlay,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
}
