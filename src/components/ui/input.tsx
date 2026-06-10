import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-input border border-border bg-secondary px-4 py-2.5 text-base text-slate-800 ring-offset-transparent file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-slate-800 placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/50 focus-visible:ring-offset-0 focus-visible:border-purple-500/30 focus-visible:bg-secondary disabled:cursor-not-allowed disabled:opacity-50 md:text-sm transition-all duration-fast",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
