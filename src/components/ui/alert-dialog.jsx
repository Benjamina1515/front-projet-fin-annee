import * as React from "react"
import { X } from "lucide-react"
import { cn } from "../../lib/utils"
import { Button } from "./button"

const AlertDialogContext = React.createContext()

const AlertDialog = ({ open, onOpenChange, children }) => {
  return (
    <AlertDialogContext.Provider value={{ open, onOpenChange }}>
      {children}
    </AlertDialogContext.Provider>
  )
}

const AlertDialogTrigger = React.forwardRef(({ className, children, asChild, ...props }, ref) => {
  const { onOpenChange } = React.useContext(AlertDialogContext)
  
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
AlertDialogTrigger.displayName = "AlertDialogTrigger"

const AlertDialogOverlay = React.forwardRef(({ className, ...props }, ref) => {
  const { open, onOpenChange } = React.useContext(AlertDialogContext)
  
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
AlertDialogOverlay.displayName = "AlertDialogOverlay"

const AlertDialogContent = React.forwardRef(({ className, children, ...props }, ref) => {
  const { open, onOpenChange } = React.useContext(AlertDialogContext)
  
  if (!open) return null
  
  return (
    <>
      <AlertDialogOverlay />
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
      </div>
    </>
  )
})
AlertDialogContent.displayName = "AlertDialogContent"

const AlertDialogHeader = ({ className, ...props }) => (
  <div
    className={cn(
      "flex flex-col space-y-2 text-center sm:text-left",
      className
    )}
    {...props}
  />
)
AlertDialogHeader.displayName = "AlertDialogHeader"

const AlertDialogFooter = ({ className, ...props }) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    )}
    {...props}
  />
)
AlertDialogFooter.displayName = "AlertDialogFooter"

const AlertDialogTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h2
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
AlertDialogTitle.displayName = "AlertDialogTitle"

const AlertDialogDescription = React.forwardRef(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-slate-500", className)}
    {...props}
  />
))
AlertDialogDescription.displayName = "AlertDialogDescription"

const AlertDialogAction = React.forwardRef(({ className, ...props }, ref) => (
  <Button
    ref={ref}
    className={cn("mt-2 sm:mt-0", className)}
    {...props}
  />
))
AlertDialogAction.displayName = "AlertDialogAction"

const AlertDialogCancel = React.forwardRef(({ className, ...props }, ref) => {
  const { onOpenChange } = React.useContext(AlertDialogContext)
  
  return (
    <Button
      ref={ref}
      variant="outline"
      className={cn("mt-2 sm:mt-0", className)}
      onClick={() => onOpenChange?.(false)}
      {...props}
    />
  )
})
AlertDialogCancel.displayName = "AlertDialogCancel"

export {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
}

