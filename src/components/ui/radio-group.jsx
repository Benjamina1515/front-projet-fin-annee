import * as React from "react";
import { cn } from "../../lib/utils";

const RadioGroupContext = React.createContext(null);

const RadioGroup = React.forwardRef(
  ({ className, value, defaultValue, onValueChange, disabled = false, children, ...props }, ref) => {
    const [internalValue, setInternalValue] = React.useState(defaultValue ?? "");
    const isControlled = value !== undefined;
    const currentValue = isControlled ? value : internalValue;

    const setValue = (val) => {
      if (disabled) return;
      if (!isControlled) setInternalValue(val);
      onValueChange?.(val);
    };

    return (
      <RadioGroupContext.Provider value={{ value: currentValue, setValue, disabled }}>
        <div ref={ref} role="radiogroup" className={cn("grid gap-2", className)} {...props}>
          {children}
        </div>
      </RadioGroupContext.Provider>
    );
  }
);
RadioGroup.displayName = "RadioGroup";

const RadioGroupItem = React.forwardRef(
  ({ className, value, id, children, disabled = false, ...props }, ref) => {
    const ctx = React.useContext(RadioGroupContext);
    const isChecked = ctx?.value === value;
    const isDisabled = disabled || ctx?.disabled;

    return (
      <label
        htmlFor={id}
        className={cn(
          "flex items-center gap-3 rounded-md border p-3 cursor-pointer transition-colors",
          isChecked ? "border-blue-600 bg-blue-50" : "border-gray-200 hover:bg-gray-50",
          isDisabled && "opacity-50 cursor-not-allowed",
          className
        )}
      >
        <span
          className={cn(
            "relative inline-flex h-5 w-5 items-center justify-center rounded-full border transition-colors",
            isChecked ? "border-blue-600" : "border-gray-300",
            isDisabled ? "bg-gray-100" : "bg-white"
          )}
        >
          <span
            className={cn(
              "block h-2.5 w-2.5 rounded-full transition-colors",
              isChecked ? "bg-blue-600" : "bg-transparent"
            )}
          />
          <input
            ref={ref}
            type="radio"
            id={id}
            value={value}
            checked={!!isChecked}
            onChange={() => ctx?.setValue(value)}
            disabled={isDisabled}
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
            {...props}
          />
        </span>
        <div className="flex-1">{children}</div>
      </label>
    );
  }
);
RadioGroupItem.displayName = "RadioGroupItem";

export { RadioGroup, RadioGroupItem };
